/**
 * Recommendation Service
 * 
 * Specialized service for generating prioritized, actionable recommendations
 * for ATS optimization based on analysis results from all other services.
 */

import { 
  ParsedCV, 
  AdvancedATSScore, 
  SemanticKeywordAnalysis, 
  ATSSystemSimulation,
  CompetitorAnalysis,
  PrioritizedRecommendation 
} from '../../types/enhanced-models';
import { RecommendationParams } from './types';

export class RecommendationService {

  /**
   * Helper to create a properly structured recommendation
   */
  private createRecommendation(base: Partial<PrioritizedRecommendation>): PrioritizedRecommendation {
    return {
      effort: 'medium' as const,
      timeEstimate: '1-2 hours',
      implementation: ['Apply recommended changes'],
      ...base,
      id: base.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: base.category || 'general',
      title: base.title || 'Optimization Needed',
      description: base.description || 'Apply recommended improvements',
      priority: base.priority || 'medium',
      impact: base.impact || 50
    };
  }

  /**
   * Generate comprehensive prioritized recommendations
   */
  async generatePrioritizedRecommendations(params: RecommendationParams): Promise<PrioritizedRecommendation[]> {
    try {
      const { parsedCV, advancedScore, semanticAnalysis, systemSimulations, competitorBenchmark } = params;
      
      
      const recommendations: PrioritizedRecommendation[] = [];
      
      // Generate different types of recommendations with safe error handling
      const keywordRecs = this.safeGenerateRecommendations(() => 
        this.generateKeywordRecommendations(semanticAnalysis, parsedCV));
      const structureRecs = this.safeGenerateRecommendations(() => 
        this.generateStructureRecommendations(parsedCV, advancedScore));
      const contentRecs = this.safeGenerateRecommendations(() => 
        this.generateContentRecommendations(parsedCV, advancedScore));
      const systemRecs = this.safeGenerateRecommendations(() => 
        this.generateSystemSpecificRecommendations(systemSimulations || []));
      const competitiveRecs = this.safeGenerateRecommendations(() => 
        this.generateCompetitiveRecommendations(competitorBenchmark, advancedScore));
      
      // Combine all recommendations
      recommendations.push(...keywordRecs);
      recommendations.push(...structureRecs);
      recommendations.push(...contentRecs);
      recommendations.push(...systemRecs);
      recommendations.push(...competitiveRecs);
      
      // Sort by priority and impact
      const prioritizedRecs = this.prioritizeRecommendations(recommendations, advancedScore);
      
      return prioritizedRecs;
    } catch (error) {
      // Return basic fallback recommendations
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Safe wrapper for generating recommendations
   */
  private safeGenerateRecommendations(generator: () => PrioritizedRecommendation[]): PrioritizedRecommendation[] {
    try {
      const result = generator();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Fallback recommendations when main generation fails
   */
  private getFallbackRecommendations(): PrioritizedRecommendation[] {
    return [
      {
        id: `fallback-structure-${Date.now()}`,
        category: 'structure',
        priority: 'medium' as const,
        title: 'Improve CV Structure',
        description: 'Review and enhance the overall structure and organization of your CV',
        impact: 70,
        effort: 'medium' as const,
        timeEstimate: '2-4 hours',
        implementation: ['Review CV structure', 'Reorganize sections logically', 'Ensure ATS-friendly formatting'],
        estimatedScoreImprovement: 10,
        actionRequired: 'modify',
        section: 'structure',
        atsSystemsAffected: ['workday', 'greenhouse', 'lever']
      },
      {
        id: `fallback-content-${Date.now()}`,
        category: 'content',
        priority: 'medium' as const,
        title: 'Enhance Content Quality',
        description: 'Add more specific achievements and quantified results to your experience descriptions',
        impact: 85,
        effort: 'high' as const,
        timeEstimate: '4-6 hours',
        implementation: ['Review experience descriptions', 'Add quantified achievements', 'Use action verbs and metrics'],
        estimatedScoreImprovement: 15,
        actionRequired: 'modify',
        section: 'experience',
        atsSystemsAffected: ['greenhouse', 'icims']
      },
      {
        id: `fallback-keywords-${Date.now()}`,
        category: 'keywords',
        priority: 'low' as const,
        title: 'Optimize Keywords',
        description: 'Include more relevant industry keywords throughout your CV',
        impact: 65,
        effort: 'medium' as const,
        timeEstimate: '1-2 hours',
        implementation: ['Research industry keywords', 'Integrate keywords naturally', 'Optimize keyword density'],
        estimatedScoreImprovement: 8,
        actionRequired: 'modify',
        section: 'content',
        atsSystemsAffected: ['workday', 'bamboohr']
      }
    ];
  }

  /**
   * Generate keyword-specific recommendations
   */
  private generateKeywordRecommendations(
    semanticAnalysis: SemanticKeywordAnalysis, 
    parsedCV: ParsedCV
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];
    
    if (!semanticAnalysis) return recommendations;

    // Missing keywords recommendations
    if (semanticAnalysis.missingKeywords && semanticAnalysis.missingKeywords.length > 0) {
      const criticalKeywords = semanticAnalysis.missingKeywords.slice(0, 5);
      
      recommendations.push(this.createRecommendation({
        id: `keyword-missing-${Date.now()}`,
        category: 'keywords',
        priority: 'high' as const,
        title: `Missing Critical Keywords`,
        description: `Missing ${criticalKeywords.length} critical keywords: ${criticalKeywords.join(', ')}. Integrate these keywords naturally into your experience descriptions and skills section`,
        impact: 85,
        effort: 'medium' as const,
        timeEstimate: '2-3 hours',
        implementation: ['Research keyword context', 'Integrate keywords naturally', 'Review and optimize placement'],
        estimatedScoreImprovement: 15,
        actionRequired: 'add',
        section: 'skills',
        keywords: criticalKeywords,
        atsSystemsAffected: ['workday', 'greenhouse', 'lever']
      }));
    }

    // Keyword density recommendations
    const currentDensity = typeof semanticAnalysis.keywordDensity === 'object' ? 
      Object.values(semanticAnalysis.keywordDensity).reduce((a, b) => a + b, 0) / Object.keys(semanticAnalysis.keywordDensity).length || 0 : 0;
    const optimalDensity = 0.03; // Standard optimal keyword density
    
    if (currentDensity < optimalDensity * 0.7) {
      recommendations.push(this.createRecommendation({
        id: `keyword-density-low-${Date.now()}`,
        category: 'keywords',
        priority: 'medium' as const,
        title: 'Keyword Density Too Low',
        description: `Keyword density too low (${(currentDensity * 100).toFixed(1)}% vs optimal ${(optimalDensity * 100).toFixed(1)}%). Increase keyword frequency by naturally incorporating relevant terms throughout your CV`,
        impact: 85,
        estimatedScoreImprovement: 10,
        actionRequired: 'modify',
        section: 'content',
        atsSystemsAffected: ['greenhouse', 'lever', 'icims']
      }));
    } else if (currentDensity > optimalDensity * 1.3) {
      recommendations.push(this.createRecommendation({
        id: `keyword-density-high-${Date.now()}`,
        category: 'keywords',
        priority: 'low' as const,
        title: 'Keyword Density Too High',
        description: `Keyword density too high (${(currentDensity * 100).toFixed(1)}% vs optimal ${(optimalDensity * 100).toFixed(1)}%). Reduce keyword repetition to avoid appearing as keyword stuffing`,
        impact: 65,
        estimatedScoreImprovement: 8,
        actionRequired: 'modify',
        section: 'content',
        atsSystemsAffected: ['workday', 'bamboohr']
      }));
    }

    // Low-frequency keyword recommendations
    if (semanticAnalysis.primaryKeywords) {
      const lowFreqKeywords = semanticAnalysis.primaryKeywords.filter(kw => kw.frequency === 1);
      if (lowFreqKeywords.length > 3) {
        recommendations.push(this.createRecommendation({
          id: `keyword-frequency-${Date.now()}`,
          category: 'keywords',
          priority: 'low' as const,
          title: 'Low Keyword Frequency',
          description: `${lowFreqKeywords.length} important keywords appear only once. Increase frequency of critical keywords by using them in multiple relevant contexts`,
          impact: 65,
          estimatedScoreImprovement: 6,
          actionRequired: 'modify',
          section: 'content',
          atsSystemsAffected: ['greenhouse', 'icims'],
          keywords: lowFreqKeywords.map(kw => kw.keyword)
        }));
      }
    }

    return recommendations;
  }

  /**
   * Generate structure and formatting recommendations
   */
  private generateStructureRecommendations(
    parsedCV: ParsedCV, 
    advancedScore: AdvancedATSScore
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];
    
    // Missing essential sections
    const missingSections: string[] = [];
    if (!parsedCV.personalInfo?.name) missingSections.push('name');
    if (!parsedCV.personalInfo?.email) missingSections.push('email');
    if (!parsedCV.personalInfo?.phone) missingSections.push('phone');
    if (!parsedCV.experience || parsedCV.experience.length === 0) missingSections.push('experience');
    if (!parsedCV.education || parsedCV.education.length === 0) missingSections.push('education');
    if (!parsedCV.skills) missingSections.push('skills');

    if (missingSections.length > 0) {
      recommendations.push(this.createRecommendation({
        id: `structure-missing-${Date.now()}`,
        category: 'structure',
        priority: 'high' as const,
        title: 'Missing Essential Sections',
        description: `Missing essential sections: ${missingSections.join(', ')}. Add all missing essential sections to ensure ATS can parse your information`,
        impact: 85,
        estimatedScoreImprovement: 25,
        actionRequired: 'add',
        section: 'structure',
        atsSystemsAffected: ['workday', 'greenhouse', 'lever', 'bamboohr', 'taleo', 'generic']
      }));
    }

    // Professional summary missing
    if (!parsedCV.personalInfo?.summary) {
      recommendations.push(this.createRecommendation({
        id: `structure-summary-${Date.now()}`,
        category: 'structure',
        priority: 'medium' as const,
        title: 'Missing Professional Summary',
        description: 'Missing professional summary section. Add a compelling 2-3 sentence professional summary at the top of your CV',
        impact: 85,
        estimatedScoreImprovement: 12,
        actionRequired: 'add',
        section: 'summary',
        atsSystemsAffected: ['workday', 'smartrecruiters']
      }));
    }

    // Date formatting issues
    const hasInconsistentDates = this.checkDateConsistency(parsedCV);
    if (hasInconsistentDates) {
      recommendations.push(this.createRecommendation({
        id: `structure-dates-${Date.now()}`,
        category: 'structure',
        priority: 'low' as const,
        title: 'Inconsistent Date Formatting',
        description: 'Inconsistent date formatting across sections. Standardize all dates to MM/YYYY format for better ATS parsing',
        impact: 65,
        estimatedScoreImprovement: 5,
        actionRequired: 'modify',
        section: 'formatting',
        atsSystemsAffected: ['workday', 'smartrecruiters', 'bamboohr']
      }));
    }

    return recommendations;
  }

  /**
   * Generate content quality recommendations
   */
  private generateContentRecommendations(
    parsedCV: ParsedCV, 
    advancedScore: AdvancedATSScore
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];
    
    // Weak experience descriptions
    const weakExperiences = this.identifyWeakExperiences(parsedCV.experience || []);
    if (weakExperiences.length > 0) {
      recommendations.push(this.createRecommendation({
        id: `content-experience-${Date.now()}`,
        category: 'content',
        priority: 'medium' as const,
        title: 'Weak Experience Descriptions',
        description: `${weakExperiences.length} experience entries lack detailed descriptions. Enhance experience descriptions with specific achievements, responsibilities, and quantified results`,
        impact: 85,
        estimatedScoreImprovement: 15,
        actionRequired: 'modify',
        section: 'experience',
        atsSystemsAffected: ['greenhouse', 'icims', 'lever']
      }));
    }

    // Lack of quantified achievements
    const hasQuantifiedAchievements = this.checkQuantifiedAchievements(parsedCV);
    if (!hasQuantifiedAchievements) {
      recommendations.push(this.createRecommendation({
        id: `content-achievements-${Date.now()}`,
        category: 'content',
        priority: 'medium' as const,
        title: 'Lacks Quantified Achievements',
        description: 'Experience lacks quantified achievements and measurable results. Add specific numbers, percentages, and metrics to demonstrate your impact',
        impact: 85,
        estimatedScoreImprovement: 20,
        actionRequired: 'modify',
        section: 'experience',
        atsSystemsAffected: ['icims', 'greenhouse', 'lever']
      }));
    }

    // Insufficient skills detail
    const skillsQuality = this.assessSkillsQuality(parsedCV.skills);
    if (skillsQuality < 0.7) {
      recommendations.push(this.createRecommendation({
        id: `content-skills-${Date.now()}`,
        category: 'content',
        priority: 'low' as const,
        title: 'Skills Section Lacks Depth',
        description: 'Skills section lacks depth and organization. Expand and categorize skills by type (Technical, Soft Skills, Tools, etc.)',
        impact: 65,
        estimatedScoreImprovement: 8,
        actionRequired: 'modify',
        section: 'skills',
        atsSystemsAffected: ['greenhouse', 'icims']
      }));
    }

    return recommendations;
  }

  /**
   * Generate ATS system-specific recommendations
   */
  private generateSystemSpecificRecommendations(
    systemSimulations: ATSSystemSimulation[]
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];
    
    // Find systems with low pass rates
    const problemSystems = systemSimulations.filter(sim => sim.passRate < 75);
    
    if (problemSystems.length > 0) {
      const systemNames = problemSystems.map(sys => sys.systemName);
      // const commonIssues = this.identifyCommonSystemIssues(problemSystems); // Unused variable
      
      recommendations.push(this.createRecommendation({
        id: `ats-compatibility-${Date.now()}`,
        category: 'ats-compatibility',
        priority: 'medium' as const,
        title: 'Low ATS Compatibility',
        description: `Low compatibility with ${systemNames.length} ATS systems: ${systemNames.join(', ')}. Address common parsing issues to improve compatibility across multiple ATS platforms`,
        impact: 85,
        estimatedScoreImprovement: 18,
        actionRequired: 'modify',
        section: 'formatting',
        atsSystemsAffected: systemNames
      }));
    }

    return recommendations;
  }

  /**
   * Generate competitive positioning recommendations
   */
  private generateCompetitiveRecommendations(
    competitorBenchmark: CompetitorAnalysis | undefined, 
    advancedScore: AdvancedATSScore
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];
    
    if (!competitorBenchmark) return recommendations;

    const currentScore = advancedScore.overall;
    const averageScore = competitorBenchmark.benchmarkScore || 75;
    
    // Below average performance
    if (currentScore < averageScore - 5) {
      recommendations.push(this.createRecommendation({
        id: `competitive-score-${Date.now()}`,
        category: 'competitive',
        priority: 'medium' as const,
        title: 'Below Industry Average',
        description: `CV scores ${currentScore} vs industry average of ${averageScore}. Implement targeted improvements to exceed industry benchmarks`,
        impact: 85,
        estimatedScoreImprovement: 22,
        actionRequired: 'modify',
        section: 'content',
        atsSystemsAffected: ['workday', 'greenhouse', 'lever', 'bamboohr', 'taleo', 'generic']
      }));
    }

    // Missing competitive advantages
    if (competitorBenchmark.competitiveAdvantage && competitorBenchmark.competitiveAdvantage.length < 3) {
      recommendations.push(this.createRecommendation({
        id: `competitive-differentiators-${Date.now()}`,
        category: 'competitive',
        priority: 'low' as const,
        title: 'Lacks Differentiators',
        description: 'CV lacks clear differentiators from other candidates. Highlight unique achievements and specialized skills that set you apart',
        impact: 85,
        estimatedScoreImprovement: 12,
        actionRequired: 'modify',
        section: 'content',
        atsSystemsAffected: ['lever', 'greenhouse']
      }));
    }

    return recommendations;
  }

  /**
   * Prioritize recommendations by impact and urgency
   */
  private prioritizeRecommendations(
    recommendations: PrioritizedRecommendation[], 
    advancedScore: AdvancedATSScore
  ): PrioritizedRecommendation[] {
    // Define priority weights
    const priorityWeights: { [key: number]: number } = {
      1: 100, // Highest priority
      2: 75,
      3: 50,
      4: 25,
      5: 10   // Lowest priority
    };

    const impactWeights: { [key: string]: number } = {
      'high': 30,
      'medium': 20,
      'low': 10
    };

    // Calculate weighted scores for sorting
    const scoredRecommendations = recommendations.map(rec => ({
      ...rec,
      _score: (priorityWeights[rec.priority] || 50) + 
              (impactWeights[rec.impact] || 20) + 
              (rec.estimatedScoreImprovement || 10)
    }));

    // Sort by score (highest first) and remove scoring field
    return scoredRecommendations
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...rec }) => rec)
      .slice(0, 15); // Limit to top 15 recommendations
  }

  // Helper methods

  private checkDateConsistency(parsedCV: ParsedCV): boolean {
    const dates: string[] = [];
    
    // Collect dates from experience
    if (parsedCV.experience) {
      parsedCV.experience.forEach(exp => {
        if (exp.startDate) dates.push(exp.startDate);
        if (exp.endDate) dates.push(exp.endDate);
      });
    }
    
    // Collect dates from education
    if (parsedCV.education) {
      parsedCV.education.forEach(edu => {
        if (edu.startDate) dates.push(edu.startDate);
        if (edu.endDate) dates.push(edu.endDate);
      });
    }

    if (dates.length < 2) return false;

    // Simple consistency check - look for different formats
    const formats = dates.map(date => this.getDateFormat(date));
    return new Set(formats).size > 1; // Inconsistent if multiple formats
  }

  private getDateFormat(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'YYYY-MM-DD';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return 'MM/DD/YYYY';
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) return 'YYYY/MM/DD';
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/i.test(date)) return 'Mon YYYY';
    if (/^\d{4}$/.test(date)) return 'YYYY';
    return 'unknown';
  }

  private identifyWeakExperiences(experiences: any[]): any[] {
    return experiences.filter(exp => 
      !exp.description || 
      exp.description.length < 50 || 
      !this.containsActionVerbs(exp.description || '')
    );
  }

  private containsActionVerbs(text: string): boolean {
    const actionVerbs = [
      'achieved', 'implemented', 'developed', 'managed', 'led', 'created', 
      'optimized', 'improved', 'increased', 'reduced', 'delivered', 'executed'
    ];
    
    const textLower = text.toLowerCase();
    return actionVerbs.some(verb => textLower.includes(verb));
  }

  private checkQuantifiedAchievements(parsedCV: ParsedCV): boolean {
    if (!parsedCV.experience) return false;
    
    return parsedCV.experience.some(exp => 
      exp.description && this.containsNumbers(exp.description)
    );
  }

  private containsNumbers(text: string): boolean {
    return /\d/.test(text) && (
      /%/.test(text) || 
      /\$/.test(text) || 
      /million|thousand|k\b/i.test(text) ||
      /increased?|improved?|reduced?|saved?/i.test(text)
    );
  }

  private assessSkillsQuality(skills: any): number {
    if (!skills) return 0;
    
    const skillsArray = this.extractSkillsArray(skills);
    if (skillsArray.length === 0) return 0;
    
    let quality = Math.min(skillsArray.length / 10, 0.7); // Up to 70% for quantity
    
    // Bonus for organization (object structure)
    if (typeof skills === 'object' && !Array.isArray(skills)) {
      quality += 0.3;
    }
    
    return Math.min(quality, 1);
  }

  private extractSkillsArray(skills: any): string[] {
    if (Array.isArray(skills)) {
      return skills.map(skill => typeof skill === 'string' ? skill : skill.name || skill.skill || '');
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

  /*
  private identifyCommonSystemIssues(problemSystems: ATSSystemSimulation[]): string[] {
    const allIssues = problemSystems.flatMap(sys => sys.specificIssues || []);
    const issueCount: { [key: string]: number } = {};
    
    // Count issue frequency
    allIssues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
    
    // Return most common issues
    return Object.entries(issueCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([issue]) => `Address: ${issue}`);
  }
  */
}