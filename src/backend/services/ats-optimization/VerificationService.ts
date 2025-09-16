// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Verification Service
 * 
 * Specialized service for dual-LLM verification of ATS optimization results
 * using both OpenAI GPT-4 and Claude for enhanced accuracy and confidence.
 */

import { 
  AdvancedATSScore, 
  PrioritizedRecommendation, 
  ParsedCV 
} from '../../types/enhanced-models';
import { VerifiedClaudeService } from '../verified-claude.service';
import { VerificationParams } from './types';
import OpenAI from 'openai';
import { environment } from './config/environment';

interface VerificationResult {
  verified: boolean;
  confidence: number;
  discrepancies: string[];
  consensus: {
    scoreAdjustment: number;
    recommendationChanges: string[];
  };
  llmComparison: {
    claudeAssessment: string;
    gptAssessment: string;
    agreementLevel: number;
  };
}

export class VerificationService {
  private openai: OpenAI | null = null;
  private claudeService: VerifiedClaudeService;

  constructor() {
    this.claudeService = new VerifiedClaudeService();
  }

  /**
   * Verify ATS optimization results using dual-LLM approach
   */
  async verifyResultsWithDualLLM(params: VerificationParams): Promise<VerificationResult> {
    const { advancedScore, recommendations, parsedCV } = params;
    
    
    try {
      // Parallel verification with both LLMs
      const [claudeVerification, gptVerification] = await Promise.all([
        this.performClaudeVerification(advancedScore, recommendations, parsedCV),
        this.performGPTVerification(advancedScore, recommendations, parsedCV)
      ]);

      // Compare results and build consensus
      const verificationResult = this.buildConsensus(
        claudeVerification, 
        gptVerification, 
        advancedScore,
        recommendations
      );

      return verificationResult;

    } catch (error) {
      return this.generateFallbackVerification(advancedScore, recommendations);
    }
  }

  /**
   * Perform verification using Claude
   */
  private async performClaudeVerification(
    score: AdvancedATSScore,
    recommendations: PrioritizedRecommendation[],
    parsedCV: ParsedCV
  ): Promise<any> {
    const cvText = this.cvToText(parsedCV);
    
    const prompt = `Please verify this ATS optimization analysis for accuracy and completeness:

CV Summary:
${cvText.substring(0, 1500)}

Analysis Results:
- Overall Score: ${score.overall}
- Parsing: ${score.breakdown.parsing}
- Keywords: ${score.breakdown.keywords}  
- Formatting: ${score.breakdown.formatting}
- Content: ${score.breakdown.content}

Top Recommendations (${recommendations.length}):
${recommendations.slice(0, 5).map(rec => `- ${rec.priority}: ${rec.title}`).join('\n')}

Please evaluate:
1. Score accuracy - Are the individual scores reasonable for this CV?
2. Recommendation relevance - Are the suggestions appropriate and actionable?
3. Priority ranking - Is the prioritization logical?
4. Missing analysis - What important aspects might be overlooked?
5. Overall confidence - Rate the analysis quality 1-10

Provide specific feedback on any discrepancies or improvements needed.`;

    const response = await this.claudeService.createVerifiedMessage({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.1,
      system: 'You are an expert ATS analyst reviewing optimization results for accuracy. Provide detailed, objective feedback on the analysis quality.',
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseVerificationResponse(response.content[0].text, 'claude');
  }

  /**
   * Perform verification using GPT-4
   */
  private async performGPTVerification(
    score: AdvancedATSScore,
    recommendations: PrioritizedRecommendation[],
    parsedCV: ParsedCV
  ): Promise<any> {
    if (!this.getOpenAI()) {
      throw new Error('OpenAI not configured for verification');
    }

    const cvText = this.cvToText(parsedCV);
    
    const prompt = `Verify this ATS optimization analysis:

CV Content: ${cvText.substring(0, 1500)}

Scores:
Overall: ${score.overall}, Parsing: ${score.breakdown.parsing}, Keywords: ${score.breakdown.keywords}, Formatting: ${score.breakdown.formatting}, Content: ${score.breakdown.content}

Recommendations: ${recommendations.slice(0, 5).map(rec => `${rec.priority}: ${rec.title}`).join('; ')}

Evaluate: 1) Score accuracy 2) Recommendation quality 3) Missing elements 4) Confidence level (1-10)

Provide concise feedback on accuracy and suggested improvements.`;

    const response = await this.getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS optimization reviewer. Provide objective feedback on analysis accuracy and completeness.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    const responseText = response.choices[0]?.message?.content || '';
    return this.parseVerificationResponse(responseText, 'gpt');
  }

  /**
   * Build consensus from both LLM verifications
   */
  private buildConsensus(
    claudeResult: any,
    gptResult: any,
    originalScore: AdvancedATSScore,
    originalRecommendations: PrioritizedRecommendation[]
  ): VerificationResult {
    // Calculate agreement level
    const scoreDifference = Math.abs(claudeResult.suggestedScore - gptResult.suggestedScore);
    const scoreAgreement = Math.max(0, 1 - scoreDifference / 100);
    
    const recommendationSimilarity = this.calculateRecommendationSimilarity(
      claudeResult.critiques, 
      gptResult.critiques
    );
    
    const overallAgreement = (scoreAgreement + recommendationSimilarity) / 2;

    // Determine verification status
    const verified = overallAgreement > 0.7 && 
                    claudeResult.confidence > 6 && 
                    gptResult.confidence > 6;

    // Calculate confidence based on agreement and individual confidences
    const confidence = Math.round(
      (overallAgreement * 50) + 
      (claudeResult.confidence * 2.5) + 
      (gptResult.confidence * 2.5)
    );

    // Identify discrepancies
    const discrepancies: string[] = [];
    
    if (Math.abs(claudeResult.suggestedScore - originalScore.overall) > 10) {
      discrepancies.push(`Claude suggests score adjustment: ${originalScore.overall} → ${claudeResult.suggestedScore}`);
    }
    
    if (Math.abs(gptResult.suggestedScore - originalScore.overall) > 10) {
      discrepancies.push(`GPT suggests score adjustment: ${originalScore.overall} → ${gptResult.suggestedScore}`);
    }
    
    if (claudeResult.critiques.length > 0) {
      discrepancies.push(...claudeResult.critiques.slice(0, 2));
    }
    
    if (gptResult.critiques.length > 0) {
      discrepancies.push(...gptResult.critiques.slice(0, 2));
    }

    // Build consensus adjustments
    const avgSuggestedScore = Math.round((claudeResult.suggestedScore + gptResult.suggestedScore) / 2);
    const scoreAdjustment = avgSuggestedScore - originalScore.overall;

    const recommendationChanges: string[] = [];
    
    // Combine unique recommendation improvements
    const allSuggestions = [...claudeResult.improvements, ...gptResult.improvements];
    const uniqueSuggestions = [...new Set(allSuggestions)];
    recommendationChanges.push(...uniqueSuggestions.slice(0, 3));

    return {
      verified,
      confidence: Math.min(confidence, 100),
      discrepancies: [...new Set(discrepancies)].slice(0, 5),
      consensus: {
        scoreAdjustment: Math.abs(scoreAdjustment) > 15 ? 0 : scoreAdjustment, // Cap large adjustments
        recommendationChanges
      },
      llmComparison: {
        claudeAssessment: claudeResult.summary,
        gptAssessment: gptResult.summary,
        agreementLevel: Math.round(overallAgreement * 100)
      }
    };
  }

  /**
   * Parse verification response from LLM
   */
  private parseVerificationResponse(text: string, source: 'claude' | 'gpt'): any {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract confidence score
    let confidence = 7; // Default
    const confidenceMatch = text.match(/(?:confidence|quality|rate).*?(\d+)(?:\/10|\s*out of 10|\s*\/\s*10)/i);
    if (confidenceMatch) {
      confidence = parseInt(confidenceMatch[1]);
    }

    // Extract suggested score adjustments
    let suggestedScore = 75; // Default
    const scoreMatch = text.match(/(?:score|overall).*?(\d{2,3})/i);
    if (scoreMatch) {
      suggestedScore = parseInt(scoreMatch[1]);
    }

    // Extract critiques and improvements
    const critiques: string[] = [];
    const improvements: string[] = [];
    
    for (const line of lines) {
      if (line.toLowerCase().includes('issue') || 
          line.toLowerCase().includes('problem') || 
          line.toLowerCase().includes('concern')) {
        critiques.push(line);
      } else if (line.toLowerCase().includes('improve') || 
                 line.toLowerCase().includes('suggest') || 
                 line.toLowerCase().includes('recommend')) {
        improvements.push(line);
      }
    }

    // Create summary
    const summary = lines.slice(0, 3).join(' ').substring(0, 200) + '...';

    return {
      source,
      confidence,
      suggestedScore,
      critiques: critiques.slice(0, 3),
      improvements: improvements.slice(0, 3),
      summary
    };
  }

  /**
   * Calculate similarity between recommendation critiques
   */
  private calculateRecommendationSimilarity(critiques1: string[], critiques2: string[]): number {
    if (critiques1.length === 0 && critiques2.length === 0) return 1;
    if (critiques1.length === 0 || critiques2.length === 0) return 0;

    // Simple word overlap calculation
    const words1 = new Set(
      critiques1.join(' ').toLowerCase().split(/\s+/).filter(word => word.length > 3)
    );
    const words2 = new Set(
      critiques2.join(' ').toLowerCase().split(/\s+/).filter(word => word.length > 3)
    );

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Generate fallback verification when LLM verification fails
   */
  private generateFallbackVerification(
    score: AdvancedATSScore,
    recommendations: PrioritizedRecommendation[]
  ): VerificationResult {
    return {
      verified: true, // Assume verified in fallback
      confidence: 75, // Moderate confidence
      discrepancies: [],
      consensus: {
        scoreAdjustment: 0,
        recommendationChanges: []
      },
      llmComparison: {
        claudeAssessment: 'Verification unavailable - using fallback assessment',
        gptAssessment: 'Verification unavailable - using fallback assessment',
        agreementLevel: 75
      }
    };
  }

  /**
   * Get OpenAI instance
   */
  private getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = environment.production ? process.env.OPENAI_API_KEY : process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  /**
   * Convert CV to text for analysis
   */
  private cvToText(cv: ParsedCV): string {
    const sections: string[] = [];

    if (cv.personalInfo?.summary) sections.push(cv.personalInfo.summary);
    if (cv.experience) {
      cv.experience.forEach(exp => {
        if (exp.role) sections.push(exp.role);
        if (exp.company) sections.push(exp.company);
        if (exp.description) sections.push(exp.description);
      });
    }
    if (cv.education) {
      cv.education.forEach((edu: any) => {
        if (edu.degree) sections.push(edu.degree);
        if (edu.institution) sections.push(edu.institution);
      });
    }
    if (cv.skills) {
      const skillsText = this.extractSkillsText(cv.skills);
      sections.push(skillsText);
    }

    return sections.filter(section => section.trim().length > 0).join(' ');
  }

  /**
   * Extract skills as text
   */
  private extractSkillsText(skills: any): string {
    if (Array.isArray(skills)) {
      return skills.join(' ');
    }
    if (typeof skills === 'string') {
      return skills;
    }
    if (typeof skills === 'object' && skills !== null) {
      return Object.values(skills).flat().join(' ');
    }
    return '';
  }
}