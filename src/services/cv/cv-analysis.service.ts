// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * CV Analysis Service
 *
 * Core service for analyzing CV content and providing insights.
 * Provides comprehensive CV analysis including ATS optimization, skills assessment,
 * and achievement highlighting.
 *
 * @author Gil Klainert
 * @version 2.0.0 - Modularized Architecture
 */

import { CVProcessingContext, ServiceResult } from '../../types';
import { BaseService } from '../../shared/utils/base-service';
import * as admin from 'firebase-admin';
import { Anthropic } from '@anthropic-ai/sdk';

export interface CVAnalysisResult {
  atsScore: number;
  skillsAnalysis: {
    technical: string[];
    soft: string[];
    missing: string[];
    recommendations: string[];
  };
  achievements: Array<{
    title: string;
    impact: string;
    significance: number;
    category: 'leadership' | 'technical' | 'business' | 'innovation';
  }>;
  personalityInsights: {
    mbtiType?: string;
    traits: string[];
    workStyle: string;
    strengths: string[];
  };
  recommendations: string[];
  optimizationSuggestions: Array<{
    type: 'content' | 'format' | 'structure';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    rationale: string;
  }>;
}

export interface CVAnalysisOptions {
  includeATSAnalysis?: boolean;
  includePersonalityInsights?: boolean;
  targetJobDescription?: string;
  analysisDepth?: 'basic' | 'standard' | 'comprehensive';
}

export class CVAnalysisService extends BaseService {
  private anthropic: Anthropic;
  private db: admin.firestore.Firestore;

  constructor() {
    super('CVAnalysisService', '2.0.0');
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
    this.db = admin.firestore();
  }

  /**
   * Analyze a CV and provide comprehensive insights
   */
  async analyzeCV(
    cvData: any,
    options: CVAnalysisOptions = {},
    context?: CVProcessingContext
  ): Promise<ServiceResult<CVAnalysisResult>> {
    try {
      this.log('info', 'Starting CV analysis', {
        analysisDepth: options.analysisDepth || 'standard'
      });

      // Extract CV content
      const cvContent = this.extractCVContent(cvData);

      // Perform comprehensive analysis
      const analysisResult: CVAnalysisResult = {
        atsScore: 0,
        skillsAnalysis: {
          technical: [],
          soft: [],
          missing: [],
          recommendations: []
        },
        achievements: [],
        personalityInsights: {
          traits: [],
          workStyle: '',
          strengths: []
        },
        recommendations: [],
        optimizationSuggestions: []
      };

      // ATS Analysis
      if (options.includeATSAnalysis !== false) {
        const atsAnalysis = await this.performATSAnalysis(cvContent, options.targetJobDescription);
        analysisResult.atsScore = atsAnalysis.score;
        analysisResult.optimizationSuggestions.push(...atsAnalysis.suggestions);
      }

      // Skills Analysis
      const skillsAnalysis = await this.analyzeSkills(cvContent, options.targetJobDescription);
      analysisResult.skillsAnalysis = skillsAnalysis;

      // Achievement Analysis
      const achievements = await this.extractAchievements(cvContent);
      analysisResult.achievements = achievements;

      // Personality Insights
      if (options.includePersonalityInsights) {
        const personalityInsights = await this.analyzePersonality(cvContent);
        analysisResult.personalityInsights = personalityInsights;
      }

      // Generate recommendations
      const recommendations = await this.generateRecommendations(analysisResult, options);
      analysisResult.recommendations = recommendations;

      // Log successful analysis
      this.log('info', 'CV analysis completed successfully', {
        atsScore: analysisResult.atsScore,
        achievementCount: analysisResult.achievements.length
      });

      return this.createSuccessResult(analysisResult, 'CV analysis completed successfully');

    } catch (error) {
      this.log('error', 'CV analysis failed', error);
      return this.createErrorResult(
        `CV analysis failed: ${(error as Error).message}`,
        error,
        'ANALYSIS_FAILED'
      );
    }
  }

  private extractCVContent(cvData: any): string {
    if (typeof cvData === 'string') {
      return cvData;
    }

    // Extract text from structured CV data
    const sections = [];

    if (cvData.personalInfo) {
      sections.push(`Personal Information: ${JSON.stringify(cvData.personalInfo)}`);
    }

    if (cvData.experience) {
      sections.push(`Experience: ${JSON.stringify(cvData.experience)}`);
    }

    if (cvData.education) {
      sections.push(`Education: ${JSON.stringify(cvData.education)}`);
    }

    if (cvData.skills) {
      sections.push(`Skills: ${JSON.stringify(cvData.skills)}`);
    }

    return sections.join('\n\n');
  }

  private async performATSAnalysis(cvContent: string, jobDescription?: string): Promise<{
    score: number;
    suggestions: Array<{
      type: 'content' | 'format' | 'structure';
      priority: 'high' | 'medium' | 'low';
      suggestion: string;
      rationale: string;
    }>;
  }> {
    const prompt = `
      Analyze this CV for ATS (Applicant Tracking System) compatibility and provide a score from 0-100.
      ${jobDescription ? `Job Description: ${jobDescription}` : ''}

      CV Content: ${cvContent}

      Provide your analysis in the following JSON format:
      {
        "score": number,
        "suggestions": [
          {
            "type": "content|format|structure",
            "priority": "high|medium|low",
            "suggestion": "specific suggestion",
            "rationale": "why this matters for ATS"
          }
        ]
      }
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      // Handle the response content which is an array
      const content = response.content[0];
      if (content && 'text' in content) {
        const result = this.safeJsonParse(content.text, {
          score: 50,
          suggestions: [{
            type: 'format',
            priority: 'medium',
            suggestion: 'Unable to perform detailed ATS analysis',
            rationale: 'Analysis service encountered a parsing error'
          }]
        });

        return {
          score: Math.max(0, Math.min(100, result.score || 50)),
          suggestions: result.suggestions || []
        };
      }

      // Fallback if content doesn't have text
      return {
        score: 50,
        suggestions: [{
          type: 'format',
          priority: 'medium',
          suggestion: 'Unable to perform detailed ATS analysis',
          rationale: 'Analysis service encountered an error'
        }]
      };
    } catch (error) {
      this.log('error', 'ATS analysis failed', error);
      return {
        score: 50,
        suggestions: [{
          type: 'format',
          priority: 'medium',
          suggestion: 'Unable to perform detailed ATS analysis',
          rationale: 'Analysis service encountered an error'
        }]
      };
    }
  }

  private async analyzeSkills(cvContent: string, jobDescription?: string) {
    const prompt = `
      Extract and analyze skills from this CV content.
      ${jobDescription ? `Compare against this job description: ${jobDescription}` : ''}

      CV Content: ${cvContent}

      Return JSON format:
      {
        "technical": ["skill1", "skill2"],
        "soft": ["skill1", "skill2"],
        "missing": ["skill1", "skill2"],
        "recommendations": ["suggestion1", "suggestion2"]
      }
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content && 'text' in content) {
        return this.safeJsonParse(content.text, {
          technical: [],
          soft: [],
          missing: [],
          recommendations: ['Unable to perform skills analysis']
        });
      }

      return {
        technical: [],
        soft: [],
        missing: [],
        recommendations: ['Unable to perform skills analysis']
      };
    } catch (error) {
      this.log('error', 'Skills analysis failed', error);
      return {
        technical: [],
        soft: [],
        missing: [],
        recommendations: ['Unable to perform skills analysis']
      };
    }
  }

  private async extractAchievements(cvContent: string) {
    const prompt = `
      Extract and analyze key achievements from this CV content.

      CV Content: ${cvContent}

      Return JSON array of achievements:
      [
        {
          "title": "achievement title",
          "impact": "measurable impact",
          "significance": number (1-10),
          "category": "leadership|technical|business|innovation"
        }
      ]
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content && 'text' in content) {
        return this.safeJsonParse(content.text, []);
      }

      return [];
    } catch (error) {
      this.log('error', 'Achievement extraction failed', error);
      return [];
    }
  }

  private async analyzePersonality(cvContent: string) {
    const prompt = `
      Analyze personality traits from CV content (writing style, experiences, etc.).

      CV Content: ${cvContent}

      Return JSON format:
      {
        "mbtiType": "XXXX or null",
        "traits": ["trait1", "trait2"],
        "workStyle": "description",
        "strengths": ["strength1", "strength2"]
      }
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content && 'text' in content) {
        return this.safeJsonParse(content.text, {
          traits: [],
          workStyle: 'Unable to determine',
          strengths: []
        });
      }

      return {
        traits: [],
        workStyle: 'Unable to determine',
        strengths: []
      };
    } catch (error) {
      this.log('error', 'Personality analysis failed', error);
      return {
        traits: [],
        workStyle: 'Unable to determine',
        strengths: []
      };
    }
  }

  private async generateRecommendations(
    analysisResult: CVAnalysisResult,
    options: CVAnalysisOptions
  ): Promise<string[]> {
    const recommendations = [];

    // ATS recommendations
    if (analysisResult.atsScore < 70) {
      recommendations.push('Improve ATS compatibility by incorporating more relevant keywords');
    }

    // Skills recommendations
    if (analysisResult.skillsAnalysis.missing.length > 0) {
      recommendations.push(`Consider developing skills in: ${analysisResult.skillsAnalysis.missing.slice(0, 3).join(', ')}`);
    }

    // Achievement recommendations
    if (analysisResult.achievements.length < 3) {
      recommendations.push('Add more quantified achievements to strengthen your CV');
    }

    return recommendations;
  }
}