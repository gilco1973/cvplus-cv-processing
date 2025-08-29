/**
 * Achievements Analysis Service for CV Processing
 */
import { AchievementHighlighting, AchievementMetrics } from '../types/enhanced-models';
// Temporarily use local types until core package is properly built
interface CVData {
  id?: string;
  personalInfo?: any;
  experience?: any[];
  education?: any[];
  skills?: string[];
  projects?: any[];
  summary?: string;
  metadata?: any;
}

export interface AchievementAnalysisRequest {
  cvData: CVData;
  targetRole?: string;
  industry?: string;
}

export interface AchievementAnalysisResult {
  achievements: AchievementHighlighting[];
  overallScore: number;
  recommendations: string[];
  processingTime: number;
}

export class AchievementsAnalysisService {
  constructor() {}

  /**
   * Analyze CV content to identify and highlight achievements
   */
  async analyzeAchievements(request: AchievementAnalysisRequest): Promise<AchievementAnalysisResult> {
    const startTime = Date.now();
    
    try {
      const achievements = await this.extractAchievements(request.cvData);
      const scoredAchievements = await this.scoreAchievements(achievements, request.targetRole);
      const enhancedAchievements = await this.enhanceAchievements(scoredAchievements);
      
      const overallScore = this.calculateOverallScore(enhancedAchievements);
      const recommendations = this.generateRecommendations(enhancedAchievements);

      return {
        achievements: enhancedAchievements,
        overallScore,
        recommendations,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Achievement analysis failed:', error);
      throw new Error('Failed to analyze achievements');
    }
  }

  /**
   * Extract potential achievements from CV data
   */
  private async extractAchievements(cvData: CVData): Promise<AchievementHighlighting[]> {
    const achievements: AchievementHighlighting[] = [];
    let achievementId = 1;

    // Analyze work experience for achievements
    if (cvData.experience) {
      for (const job of cvData.experience) {
        if (job.achievements && Array.isArray(job.achievements)) {
          for (const achievement of job.achievements) {
            achievements.push({
              id: `work-${achievementId++}`,
              title: job.position || 'Work Achievement',
              description: typeof achievement === 'string' ? achievement : achievement.description || '',
              impact: this.extractImpact(typeof achievement === 'string' ? achievement : achievement.description || ''),
              category: 'career',
              confidence: 0.8,
              suggestions: []
            });
          }
        }

        // Extract achievements from job descriptions
        if (job.description) {
          const extractedAchievements = this.extractAchievementsFromText(job.description);
          for (const achievement of extractedAchievements) {
            achievements.push({
              id: `extracted-${achievementId++}`,
              title: job.position || 'Career Achievement',
              description: achievement,
              impact: this.extractImpact(achievement),
              category: 'career',
              confidence: 0.6,
              suggestions: []
            });
          }
        }
      }
    }

    // Analyze education for achievements
    if (cvData.education) {
      for (const edu of cvData.education) {
        if (edu.achievements && Array.isArray(edu.achievements)) {
          for (const achievement of edu.achievements) {
            achievements.push({
              id: `edu-${achievementId++}`,
              title: edu.degree || 'Educational Achievement',
              description: achievement,
              impact: this.extractImpact(achievement),
              category: 'education',
              confidence: 0.7,
              suggestions: []
            });
          }
        }
      }
    }

    // Analyze projects for achievements
    if (cvData.projects) {
      for (const project of cvData.projects) {
        achievements.push({
          id: `proj-${achievementId++}`,
          title: project.name,
          description: project.description,
          impact: this.extractImpact(project.description),
          category: 'project',
          confidence: 0.7,
          suggestions: []
        });
      }
    }

    return achievements;
  }

  /**
   * Extract impact statement from achievement text
   */
  private extractImpact(text: string): string {
    const impactKeywords = ['increased', 'improved', 'reduced', 'achieved', 'delivered', 'generated', 'saved', 'grew', 'built', 'created'];
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (impactKeywords.some(keyword => lowerSentence.includes(keyword))) {
        return sentence.trim();
      }
    }
    
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  }

  /**
   * Extract achievements from text using pattern matching
   */
  private extractAchievementsFromText(text: string): string[] {
    const achievements: string[] = [];
    const achievementPatterns = [
      /(?:achieved|accomplished|delivered|generated|increased|improved|reduced|saved|grew|built|created|led|managed|developed)\s+[^.!?]*[0-9%$]+[^.!?]*[.!?]/gi,
      /(?:responsible for|resulted in|contributed to)\s+[^.!?]*(?:increase|improvement|reduction|growth|development)[^.!?]*[.!?]/gi
    ];

    for (const pattern of achievementPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        achievements.push(...matches.map(match => match.trim()));
      }
    }

    return achievements;
  }

  /**
   * Score achievements based on impact and relevance
   */
  private async scoreAchievements(
    achievements: AchievementHighlighting[], 
    targetRole?: string
  ): Promise<AchievementHighlighting[]> {
    // TODO: Use targetRole for relevance scoring in future iteration
    void targetRole; // Mark as used
    
    return achievements.map(achievement => {
      const metrics = this.calculateMetrics(achievement);
      return {
        ...achievement,
        metrics,
        confidence: metrics.relevanceScore * 0.7 + metrics.impactScore * 0.3
      };
    });
  }

  /**
   * Calculate metrics for an achievement
   */
  private calculateMetrics(achievement: AchievementHighlighting): AchievementMetrics {
    const text = achievement.description;
    const hasNumbers = /\d/.test(text);
    const hasPercent = /%/.test(text);
    const hasCurrency = /[$€£¥]/.test(text);
    const hasActionWords = /(?:increased|improved|reduced|achieved|delivered|generated|saved|grew|built|created|led|managed|developed)/i.test(text);

    const impactScore = (
      (hasNumbers ? 0.3 : 0) +
      (hasPercent ? 0.2 : 0) +
      (hasCurrency ? 0.2 : 0) +
      (hasActionWords ? 0.3 : 0)
    );

    const relevanceScore = achievement.category === 'career' ? 0.9 : 0.7;

    return {
      quantifiable: hasNumbers || hasPercent || hasCurrency,
      impactScore: Math.min(impactScore, 1.0),
      relevanceScore,
      originalText: text,
      enhancedText: text // Will be enhanced in the next step
    };
  }

  /**
   * Enhance achievements with suggestions
   */
  private async enhanceAchievements(achievements: AchievementHighlighting[]): Promise<AchievementHighlighting[]> {
    return achievements.map(achievement => {
      const suggestions = this.generateSuggestions(achievement);
      return {
        ...achievement,
        suggestions
      };
    });
  }

  /**
   * Generate suggestions for improving achievements
   */
  private generateSuggestions(achievement: AchievementHighlighting): string[] {
    const suggestions: string[] = [];
    
    if (!achievement.metrics?.quantifiable) {
      suggestions.push('Add specific numbers, percentages, or metrics to quantify the impact');
    }
    
    if (achievement.confidence < 0.7) {
      suggestions.push('Provide more context about the achievement and its significance');
    }
    
    if (!achievement.description.match(/(?:increased|improved|reduced|achieved|delivered|generated|saved|grew|built|created|led|managed|developed)/i)) {
      suggestions.push('Use strong action verbs to describe the achievement');
    }
    
    return suggestions;
  }

  /**
   * Calculate overall achievement score
   */
  private calculateOverallScore(achievements: AchievementHighlighting[]): number {
    if (achievements.length === 0) return 0;
    
    const totalScore = achievements.reduce((sum, achievement) => sum + achievement.confidence, 0);
    const averageScore = totalScore / achievements.length;
    
    // Bonus for having multiple quantified achievements
    const quantifiedCount = achievements.filter(a => a.metrics?.quantifiable).length;
    const quantifiedBonus = Math.min(quantifiedCount * 0.1, 0.3);
    
    return Math.min(averageScore + quantifiedBonus, 1.0);
  }

  /**
   * Generate recommendations for improving achievements
   */
  private generateRecommendations(achievements: AchievementHighlighting[]): string[] {
    const recommendations: string[] = [];
    
    const quantifiedCount = achievements.filter(a => a.metrics?.quantifiable).length;
    const totalCount = achievements.length;
    
    if (quantifiedCount < totalCount * 0.5) {
      recommendations.push('Add more quantifiable metrics to your achievements (numbers, percentages, dollar amounts)');
    }
    
    if (totalCount < 3) {
      recommendations.push('Include more achievements to demonstrate your impact and value');
    }
    
    const lowConfidenceCount = achievements.filter(a => a.confidence < 0.7).length;
    if (lowConfidenceCount > totalCount * 0.3) {
      recommendations.push('Strengthen weak achievements with more specific details and context');
    }
    
    return recommendations;
  }

  /**
   * Extract key achievements from CV data (method expected by achievementHighlighting function)
   */
  async extractKeyAchievements(cvData: CVData): Promise<AchievementHighlighting[]> {
    const result = await this.analyzeAchievements({ cvData });
    return result.achievements;
  }

  /**
   * Generate achievements HTML for display (method expected by achievementHighlighting function)
   */
  async generateAchievementsHTML(achievements: AchievementHighlighting[]): Promise<string> {
    if (achievements.length === 0) {
      return '<div class="no-achievements">No achievements identified</div>';
    }

    const achievementsHTML = achievements.map(achievement => `
      <div class="achievement" data-confidence="${achievement.confidence}">
        <h3 class="achievement-title">${achievement.title}</h3>
        <p class="achievement-description">${achievement.description}</p>
        <div class="achievement-impact">${achievement.impact}</div>
        ${achievement.metrics?.quantifiable ? '<span class="quantified-badge">Quantified</span>' : ''}
        ${achievement.suggestions && achievement.suggestions.length > 0 ? `
          <div class="suggestions">
            <h4>Suggestions for improvement:</h4>
            <ul>
              ${achievement.suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <div class="achievements-container">
        <h2>Key Achievements</h2>
        ${achievementsHTML}
        <div class="achievements-summary">
          <p>Overall Achievement Score: ${Math.round(this.calculateOverallScore(achievements) * 100)}%</p>
          <p>Quantified Achievements: ${achievements.filter(a => a.metrics?.quantifiable).length}/${achievements.length}</p>
        </div>
      </div>
    `;
  }
}