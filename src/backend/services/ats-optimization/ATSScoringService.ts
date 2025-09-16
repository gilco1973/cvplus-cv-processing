// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * ATS Scoring Service
 * 
 * Specialized service for calculating multi-factor ATS scores with weighted breakdown.
 * Provides comprehensive scoring across parsing, keywords, formatting, and content quality.
 */

import { 
  ParsedCV, 
  AdvancedATSScore, 
  SemanticKeywordAnalysis
} from '../../types/enhanced-models';
import { ScoringParams } from './types';

export class ATSScoringService {

  /**
   * Calculate comprehensive advanced ATS score
   */
  calculateAdvancedScore(params: ScoringParams): AdvancedATSScore {
    const { parsedCV, semanticAnalysis, systemSimulations, competitorBenchmark } = params;

    // Calculate individual component scores
    const parsingScore = this.calculateParsingScore(parsedCV);
    const keywordScore = this.calculateKeywordScore(semanticAnalysis);
    const formattingScore = this.calculateFormattingScore(parsedCV);
    const contentScore = this.calculateContentScore(parsedCV);

    // Calculate advanced metrics
    const specificityScore = this.calculateSpecificityScore(parsedCV, semanticAnalysis);
    const confidence = this.calculateConfidence(parsedCV, semanticAnalysis);

    // Weighted overall score calculation
    const weights = {
      parsing: 0.25,
      keywords: 0.30,
      formatting: 0.20,
      content: 0.25
    };

    const overall = Math.round(
      (parsingScore * weights.parsing +
       keywordScore * weights.keywords +
       formattingScore * weights.formatting +
       contentScore * weights.content)
    );

    return {
      overall,
      breakdown: {
        parsing: parsingScore,
        formatting: formattingScore,
        keywords: keywordScore,
        content: contentScore,
        specificity: specificityScore,
        experience: 80,
        education: 80,
        skills: 80,
        achievements: 80
      },
      recommendations: [], // Will be populated by RecommendationService
      competitorAnalysis: competitorBenchmark || {
        similarProfiles: 0,
        keywordGaps: [],
        strengthsVsCompetitors: [],
        improvementOpportunities: [],
        marketPositioning: 'Standard',
        competitiveAdvantage: [],
        benchmarkScore: overall
      },
      semanticKeywords: {
        primaryKeywords: [],
        secondaryKeywords: [],
        missingKeywords: [],
        keywordDensity: {},
        synonyms: {},
        contextualRelevance: {},
        industryTerms: [],
        trendingKeywords: []
      },
      industryBenchmark: overall * 0.9,
      estimatedPassRate: overall / 100,
      simulationResults: systemSimulations || []
    };
  }

  /**
   * Calculate parsing score based on CV structure and completeness
   */
  private calculateParsingScore(parsedCV: ParsedCV): number {
    let score = 0;
    const maxScore = 100;

    // Essential sections (40 points)
    if (parsedCV.personalInfo?.name) score += 10;
    if (parsedCV.personalInfo?.email && this.isValidEmail(parsedCV.personalInfo.email)) score += 10;
    if (parsedCV.personalInfo?.phone) score += 5;
    if (parsedCV.experience && parsedCV.experience.length > 0) score += 15;

    // Important sections (30 points)
    if (parsedCV.education && parsedCV.education.length > 0) score += 10;
    if (parsedCV.skills) score += 10;
    if (parsedCV.personalInfo?.summary) score += 10;

    // Additional sections (20 points)
    if (parsedCV.certifications && parsedCV.certifications.length > 0) score += 5;
    if (parsedCV.projects && parsedCV.projects.length > 0) score += 5;
    if ((parsedCV as any).languages && (parsedCV as any).languages.length > 0) score += 5;
    if (parsedCV.achievements && parsedCV.achievements.length > 0) score += 5;

    // Data quality (10 points)
    const experienceQuality = this.assessExperienceQuality(parsedCV.experience || []);
    score += Math.round(experienceQuality * 10);

    return Math.min(score, maxScore);
  }

  /**
   * Calculate keyword optimization score
   */
  private calculateKeywordScore(semanticAnalysis: SemanticKeywordAnalysis): number {
    if (!semanticAnalysis) return 0;

    let score = 0;
    const maxScore = 100;

    // Keyword presence (40 points)
    const matchedCount = (semanticAnalysis as any).matchedKeywords?.length || 0;
    const totalKeywords = matchedCount + ((semanticAnalysis as any).missingKeywords?.length || 0);
    
    if (totalKeywords > 0) {
      const matchRatio = matchedCount / totalKeywords;
      score += Math.round(matchRatio * 40);
    }

    // Keyword density (25 points)
    const currentDensity = (semanticAnalysis as any).keywordDensity || 0;
    const optimalDensity = (semanticAnalysis as any).optimalDensity || 0.03;
    
    if (currentDensity > 0) {
      const densityScore = Math.max(0, 1 - Math.abs(currentDensity - optimalDensity) / optimalDensity);
      score += Math.round(densityScore * 25);
    }

    // Keyword relevance (25 points)
    if ((semanticAnalysis as any).matchedKeywords) {
      const avgRelevance = (semanticAnalysis as any).matchedKeywords.reduce(
        (sum: number, kw: any) => sum + (kw.relevanceScore || 0.5), 
        0
      ) / (semanticAnalysis as any).matchedKeywords.length;
      score += Math.round(avgRelevance * 25);
    }

    // Semantic variations (10 points)
    const variationsCount = (semanticAnalysis as any).semanticVariations?.length || 0;
    score += Math.min(variationsCount * 2, 10);

    return Math.min(score, maxScore);
  }

  /**
   * Calculate formatting and structure score
   */
  private calculateFormattingScore(parsedCV: ParsedCV): number {
    let score = 0;
    const maxScore = 100;

    // Section organization (30 points)
    const expectedSections = ['personalInfo', 'experience', 'education', 'skills'];
    const presentSections = expectedSections.filter(section => 
      parsedCV[section as keyof ParsedCV] && 
      (Array.isArray(parsedCV[section as keyof ParsedCV]) ? 
        (parsedCV[section as keyof ParsedCV] as any[]).length > 0 : 
        Object.keys(parsedCV[section as keyof ParsedCV] as object).length > 0)
    );
    score += Math.round((presentSections.length / expectedSections.length) * 30);

    // Date formatting (20 points)
    let dateScore = 0;
    let totalDates = 0;

    if (parsedCV.experience) {
      parsedCV.experience.forEach((exp: any) => {
        if (exp.startDate) {
          totalDates++;
          if (this.isValidDateFormat(exp.startDate)) dateScore++;
        }
        if (exp.endDate) {
          totalDates++;
          if (this.isValidDateFormat(exp.endDate)) dateScore++;
        }
      });
    }

    if (parsedCV.education) {
      parsedCV.education.forEach((edu: any) => {
        if (edu.startDate) {
          totalDates++;
          if (this.isValidDateFormat(edu.startDate)) dateScore++;
        }
        if (edu.endDate) {
          totalDates++;
          if (this.isValidDateFormat(edu.endDate)) dateScore++;
        }
      });
    }

    if (totalDates > 0) {
      score += Math.round((dateScore / totalDates) * 20);
    } else {
      score += 10; // Partial score if no dates present
    }

    // Contact information formatting (20 points)
    let contactScore = 0;
    if (parsedCV.personalInfo?.email && this.isValidEmail(parsedCV.personalInfo.email)) {
      contactScore += 10;
    }
    if (parsedCV.personalInfo?.phone) {
      contactScore += 10;
    }
    score += contactScore;

    // Consistency and completeness (30 points)
    const consistencyScore = this.assessDataConsistency(parsedCV);
    score += Math.round(consistencyScore * 30);

    return Math.min(score, maxScore);
  }

  /**
   * Calculate content quality score
   */
  private calculateContentScore(parsedCV: ParsedCV): number {
    let score = 0;
    const maxScore = 100;

    // Experience descriptions quality (40 points)
    if (parsedCV.experience && parsedCV.experience.length > 0) {
      const experienceScore = this.assessExperienceQuality(parsedCV.experience);
      score += Math.round(experienceScore * 40);
    }

    // Skills categorization and depth (25 points)
    const skillsScore = this.assessSkillsQuality(parsedCV.skills);
    score += Math.round(skillsScore * 25);

    // Professional summary quality (20 points)
    if (parsedCV.personalInfo?.summary) {
      const summaryScore = this.assessSummaryQuality(parsedCV.personalInfo.summary);
      score += Math.round(summaryScore * 20);
    }

    // Quantifiable achievements (15 points)
    const achievementsScore = this.assessQuantifiableAchievements(parsedCV);
    score += Math.round(achievementsScore * 15);

    return Math.min(score, maxScore);
  }

  /**
   * Calculate specificity score based on detailed, quantified content
   */
  private calculateSpecificityScore(parsedCV: ParsedCV, semanticAnalysis: SemanticKeywordAnalysis): number {
    let score = 0;
    let factors = 0;

    // Quantified achievements
    const quantifiedScore = this.assessQuantifiableAchievements(parsedCV);
    score += quantifiedScore;
    factors++;

    // Technical depth in skills
    const skillsDepth = this.assessTechnicalDepth(parsedCV.skills);
    score += skillsDepth;
    factors++;

    // Keyword context quality
    if ((semanticAnalysis as any).matchedKeywords) {
      const contextScore = (semanticAnalysis as any).matchedKeywords.reduce((sum: number, kw: any) => {
        const contextQuality = (kw.context?.length || 0) > 0 ? 0.8 : 0.3;
        return sum + contextQuality;
      }, 0) / (semanticAnalysis as any).matchedKeywords.length;
      
      score += contextScore;
      factors++;
    }

    return factors > 0 ? Math.round((score / factors) * 100) : 50;
  }

  /**
   * Calculate confidence level based on data completeness and quality
   */
  private calculateConfidence(parsedCV: ParsedCV, semanticAnalysis: SemanticKeywordAnalysis): number {
    let confidence = 0;
    let factors = 0;

    // Data completeness factor
    const completeness = this.assessDataCompleteness(parsedCV);
    confidence += completeness;
    factors++;

    // Keyword analysis confidence
    if (semanticAnalysis && (semanticAnalysis as any).matchedKeywords) {
      const keywordConfidence = (semanticAnalysis as any).matchedKeywords.length > 3 ? 0.9 : 0.6;
      confidence += keywordConfidence;
      factors++;
    }

    // Structure consistency factor
    const consistency = this.assessDataConsistency(parsedCV);
    confidence += consistency;
    factors++;

    return factors > 0 ? Math.round((confidence / factors) * 100) / 100 : 0.7;
  }

  // Note: calculatePercentileScore removed as unused - reserved for future competitive analysis features

  // Note: calculateCompetitiveAdvantage removed as unused - reserved for future competitive analysis features

  // Note: identifyImprovementAreas removed as unused - reserved for future improvement analysis features

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDateFormat(date: string): boolean {
    // Accept various date formats
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,     // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/,   // MM/DD/YYYY
      /^\d{4}\/\d{2}\/\d{2}$/,   // YYYY/MM/DD
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/i, // Mon YYYY
      /^\d{4}$/                   // YYYY only
    ];
    
    return datePatterns.some(pattern => pattern.test(date));
  }

  private assessExperienceQuality(experiences: any[]): number {
    if (!experiences || experiences.length === 0) return 0;

    let qualityScore = 0;
    
    experiences.forEach((exp: any) => {
      let expScore = 0;
      
      if (exp.role) expScore += 0.2;
      if (exp.company) expScore += 0.2;
      if (exp.description && exp.description.length > 50) expScore += 0.3;
      if (exp.startDate) expScore += 0.15;
      if (exp.endDate || exp.current) expScore += 0.15;
      
      qualityScore += expScore;
    });
    
    return qualityScore / experiences.length;
  }

  private assessSkillsQuality(skills: any): number {
    if (!skills) return 0;

    const skillsArray = this.extractSkillsArray(skills);
    if (skillsArray.length === 0) return 0;

    // Basic scoring based on quantity and diversity
    let score = Math.min(skillsArray.length / 10, 1); // Up to 10 skills for full score
    
    // Bonus for skill categories/organization
    if (typeof skills === 'object' && !Array.isArray(skills)) {
      score = Math.min(score + 0.2, 1);
    }

    return score;
  }

  private assessSummaryQuality(summary: string): number {
    if (!summary || summary.length < 20) return 0;
    
    let score = 0;
    
    // Length check
    if (summary.length >= 100 && summary.length <= 300) score += 0.4;
    else if (summary.length >= 50) score += 0.2;
    
    // Professional keywords
    const professionalWords = ['experience', 'skilled', 'expertise', 'professional', 'accomplished', 'proven'];
    const foundWords = professionalWords.filter(word => 
      summary.toLowerCase().includes(word.toLowerCase())
    );
    score += Math.min(foundWords.length / professionalWords.length, 0.4);
    
    // Action words
    const actionWords = ['managed', 'led', 'developed', 'implemented', 'achieved', 'improved'];
    const foundActions = actionWords.filter(word => 
      summary.toLowerCase().includes(word.toLowerCase())
    );
    score += Math.min(foundActions.length / 3, 0.2);
    
    return Math.min(score, 1);
  }

  private assessQuantifiableAchievements(parsedCV: ParsedCV): number {
    let quantifiedCount = 0;
    let totalDescriptions = 0;

    // Check experience descriptions for numbers/metrics
    if (parsedCV.experience) {
      parsedCV.experience.forEach((exp: any) => {
        if (exp.description) {
          totalDescriptions++;
          if (this.containsQuantifiableMetrics(exp.description)) {
            quantifiedCount++;
          }
        }
      });
    }

    // Check achievements section
    if (parsedCV.achievements) {
      parsedCV.achievements.forEach((achievement: any) => {
        totalDescriptions++;
        const text = typeof achievement === 'string' ? achievement : achievement.description || '';
        if (this.containsQuantifiableMetrics(text)) {
          quantifiedCount++;
        }
      });
    }

    return totalDescriptions > 0 ? quantifiedCount / totalDescriptions : 0;
  }

  private containsQuantifiableMetrics(text: string): boolean {
    // Look for numbers, percentages, currency, etc.
    const metricPatterns = [
      /\d+%/, // Percentages
      /\$\d+/, // Currency
      /\d+\s*(million|thousand|k|m)/i, // Large numbers
      /\d+\s*(years?|months?|weeks?)/i, // Time periods
      /\d+\s*(people|employees|members|clients|customers)/i, // People/relationships
      /increased?.*\d+/i, // Growth metrics
      /reduced?.*\d+/i, // Reduction metrics
      /improved?.*\d+/i // Improvement metrics
    ];

    return metricPatterns.some(pattern => pattern.test(text));
  }

  private assessTechnicalDepth(skills: any): number {
    const skillsArray = this.extractSkillsArray(skills);
    
    // Look for specific technical skills vs generic ones
    const technicalKeywords = [
      'API', 'database', 'cloud', 'framework', 'library', 'programming',
      'software', 'system', 'platform', 'tool', 'technology', 'protocol'
    ];

    const technicalSkills = skillsArray.filter((skill: any) => 
      technicalKeywords.some(keyword => 
        skill.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    return skillsArray.length > 0 ? technicalSkills.length / skillsArray.length : 0;
  }

  private assessDataCompleteness(parsedCV: ParsedCV): number {
    const requiredFields = [
      'personalInfo.name',
      'personalInfo.email', 
      'experience',
      'education',
      'skills'
    ];

    let completedFields = 0;
    
    if (parsedCV.personalInfo?.name) completedFields++;
    if (parsedCV.personalInfo?.email) completedFields++;
    if (parsedCV.experience && parsedCV.experience.length > 0) completedFields++;
    if (parsedCV.education && parsedCV.education.length > 0) completedFields++;
    if (parsedCV.skills) completedFields++;

    return completedFields / requiredFields.length;
  }

  private assessDataConsistency(parsedCV: ParsedCV): number {
    let consistencyScore = 1.0;

    // Check date consistency in experience
    if (parsedCV.experience) {
      parsedCV.experience.forEach((exp: any) => {
        if (exp.startDate && exp.endDate && !exp.current) {
          // Basic date logic check (simplified)
          if (exp.startDate > exp.endDate) {
            consistencyScore -= 0.1;
          }
        }
      });
    }

    // Check for duplicate information
    const emails = parsedCV.personalInfo?.email ? [parsedCV.personalInfo.email] : [];
    if (new Set(emails).size !== emails.length) {
      consistencyScore -= 0.1;
    }

    return Math.max(0, consistencyScore);
  }

  private extractSkillsArray(skills: any): string[] {
    if (Array.isArray(skills)) {
      return skills.map((skill: any) => typeof skill === 'string' ? skill : skill.name || skill.skill || '');
    }
    if (typeof skills === 'string') {
      return skills.split(/[,;|\n]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    if (typeof skills === 'object' && skills !== null) {
      return Object.values(skills).flat().map((skill: any) => 
        typeof skill === 'string' ? skill : skill?.name || skill?.skill || ''
      );
    }
    return [];
  }
}