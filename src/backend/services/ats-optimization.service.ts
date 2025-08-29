/**
 * ATS Optimization Service for CV Processing
 */
import { ATSOptimization, KeywordMatch, FormatOptimization, ATSRecommendation } from '../types/enhanced-models';
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

export interface ATSOptimizationRequest {
  cvData: CVData;
  jobDescription?: string;
  targetKeywords?: string[];
}

export interface ATSOptimizationResult {
  optimization: ATSOptimization;
  processingTime: number;
  confidence: number;
}

export class ATSOptimizationService {
  
  async optimizeForATS(request: ATSOptimizationRequest): Promise<ATSOptimizationResult> {
    const startTime = Date.now();
    
    try {
      const keywordMatches = await this.analyzeKeywords(request.cvData, request.jobDescription, request.targetKeywords);
      const formatOptimization = await this.analyzeFormat(request.cvData);
      const recommendations = await this.generateRecommendations(keywordMatches, formatOptimization);
      
      const score = this.calculateATSScore(keywordMatches, formatOptimization);
      
      const optimization: ATSOptimization = {
        score,
        keywordMatches,
        formatOptimization,
        recommendations
      };

      return {
        optimization,
        processingTime: Date.now() - startTime,
        confidence: 0.85
      };
    } catch (error) {
      console.error('ATS optimization failed:', error);
      throw new Error('Failed to optimize CV for ATS');
    }
  }

  private async analyzeKeywords(
    cvData: CVData, 
    jobDescription?: string, 
    targetKeywords?: string[]
  ): Promise<KeywordMatch[]> {
    const cvText = this.extractCVText(cvData).toLowerCase();
    const keywords = this.extractKeywords(jobDescription, targetKeywords);
    
    return keywords.map(keyword => {
      const keywordLower = keyword.toLowerCase();
      const frequency = (cvText.match(new RegExp(keywordLower, 'g')) || []).length;
      const found = frequency > 0;
      
      return {
        keyword,
        found,
        frequency,
        context: found ? this.extractContext(cvText, keywordLower) : '',
        importance: this.getKeywordImportance(keyword)
      };
    });
  }

  private extractCVText(cvData: CVData): string {
    let text = '';
    
    if (cvData.summary) text += cvData.summary + ' ';
    if (cvData.skills) text += cvData.skills.join(' ') + ' ';
    
    if (cvData.experience) {
      cvData.experience.forEach((job: any) => {
        if (job.position) text += job.position + ' ';
        if (job.company) text += job.company + ' ';
        if (job.description) text += job.description + ' ';
      });
    }
    
    if (cvData.education) {
      cvData.education.forEach((edu: any) => {
        if (edu.degree) text += edu.degree + ' ';
        if (edu.institution) text += edu.institution + ' ';
        if (edu.description) text += edu.description + ' ';
      });
    }
    
    return text;
  }

  private extractKeywords(jobDescription?: string, targetKeywords?: string[]): string[] {
    const keywords = new Set<string>();
    
    if (targetKeywords) {
      targetKeywords.forEach(keyword => keywords.add(keyword));
    }
    
    if (jobDescription) {
      // Extract common technical and skill keywords from job description
      const commonKeywords = [
        'javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker', 
        'kubernetes', 'sql', 'nosql', 'agile', 'scrum', 'leadership', 'management',
        'communication', 'problem solving', 'teamwork', 'analytical', 'creative'
      ];
      
      const jobText = jobDescription.toLowerCase();
      commonKeywords.forEach(keyword => {
        if (jobText.includes(keyword)) {
          keywords.add(keyword);
        }
      });
    }
    
    return Array.from(keywords);
  }

  private extractContext(text: string, keyword: string): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    
    return text.substring(start, end).trim();
  }

  private getKeywordImportance(keyword: string): number {
    const highImportance = ['management', 'leadership', 'senior', 'lead', 'director'];
    const mediumImportance = ['experience', 'skills', 'proficient', 'expert'];
    
    const keywordLower = keyword.toLowerCase();
    
    if (highImportance.some(term => keywordLower.includes(term))) return 0.9;
    if (mediumImportance.some(term => keywordLower.includes(term))) return 0.7;
    
    return 0.5;
  }

  private async analyzeFormat(cvData: CVData): Promise<FormatOptimization> {
    const structureScore = this.evaluateStructure(cvData);
    const readabilityScore = this.evaluateReadability(cvData);
    const keywordsScore = this.evaluateKeywordUsage(cvData);
    const formattingScore = 0.8; // Assume good formatting for now
    
    const recommendations: string[] = [];
    
    if (structureScore < 0.7) {
      recommendations.push('Improve CV structure with clear sections and consistent formatting');
    }
    
    if (readabilityScore < 0.7) {
      recommendations.push('Enhance readability with better bullet points and concise descriptions');
    }
    
    if (keywordsScore < 0.6) {
      recommendations.push('Include more relevant keywords from the job description');
    }
    
    return {
      structure: structureScore,
      readability: readabilityScore,
      keywords: keywordsScore,
      formatting: formattingScore,
      recommendations
    };
  }

  private evaluateStructure(cvData: CVData): number {
    let score = 0;
    
    if (cvData.personalInfo?.name) score += 0.2;
    if (cvData.personalInfo?.email) score += 0.1;
    if (cvData.summary) score += 0.2;
    if (cvData.experience && cvData.experience.length > 0) score += 0.3;
    if (cvData.skills && cvData.skills.length > 0) score += 0.1;
    if (cvData.education && cvData.education.length > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private evaluateReadability(cvData: CVData): number {
    let score = 0.8; // Base score
    
    // Check for bullet points in experience descriptions
    if (cvData.experience) {
      const hasBullets = cvData.experience.some(job => 
        job.description && job.description.includes('•')
      );
      if (hasBullets) score += 0.1;
    }
    
    // Check summary length
    if (cvData.summary) {
      const summaryLength = cvData.summary.length;
      if (summaryLength >= 100 && summaryLength <= 300) {
        score += 0.1;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private evaluateKeywordUsage(cvData: CVData): number {
    const cvText = this.extractCVText(cvData);
    const commonKeywords = [
      'experience', 'skills', 'management', 'development', 'team', 'project',
      'leadership', 'communication', 'problem solving', 'analytical'
    ];
    
    const foundKeywords = commonKeywords.filter(keyword => 
      cvText.toLowerCase().includes(keyword)
    );
    
    return foundKeywords.length / commonKeywords.length;
  }

  private calculateATSScore(keywordMatches: KeywordMatch[], formatOptimization: FormatOptimization): number {
    const keywordScore = keywordMatches.length > 0 
      ? keywordMatches.filter(match => match.found).length / keywordMatches.length 
      : 0.5;
    
    const formatScore = (
      formatOptimization.structure + 
      formatOptimization.readability + 
      formatOptimization.keywords + 
      formatOptimization.formatting
    ) / 4;
    
    return (keywordScore * 0.6 + formatScore * 0.4);
  }

  private async generateRecommendations(
    keywordMatches: KeywordMatch[], 
    formatOptimization: FormatOptimization
  ): Promise<ATSRecommendation[]> {
    const recommendations: ATSRecommendation[] = [];
    
    // Keyword recommendations
    const missingKeywords = keywordMatches.filter(match => !match.found);
    if (missingKeywords.length > 0) {
      recommendations.push({
        type: 'keyword',
        priority: 'high',
        description: `Add missing keywords: ${missingKeywords.map(k => k.keyword).join(', ')}`,
        implementation: 'Incorporate these keywords naturally into your experience descriptions and skills section'
      });
    }
    
    // Format recommendations
    if (formatOptimization.structure < 0.7) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        description: 'Improve CV structure and organization',
        implementation: 'Ensure all sections are clearly labeled and content is well-organized'
      });
    }
    
    if (formatOptimization.readability < 0.7) {
      recommendations.push({
        type: 'format',
        priority: 'medium',
        description: 'Enhance readability and formatting',
        implementation: 'Use bullet points, consistent formatting, and clear section headers'
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze ATS compatibility (method expected by atsOptimization function)
   */
  async analyzeATSCompatibility(cvData: CVData, jobDescription?: string): Promise<ATSOptimization> {
    const result = await this.optimizeForATS({ cvData, jobDescription });
    return result.optimization;
  }

  /**
   * Apply ATS optimizations to CV (method expected by atsOptimization function)
   */
  async applyOptimizations(cvData: CVData, optimizations: ATSRecommendation[]): Promise<CVData> {
    // This would apply the optimizations to the CV data
    // For now, return the original CV data with a flag indicating optimizations were applied
    return {
      ...cvData,
      metadata: {
        ...cvData.metadata,
        atsOptimized: true,
        optimizationsApplied: optimizations.length
      }
    } as CVData;
  }

  /**
   * Get ATS-friendly templates (method expected by atsOptimization function)
   */
  async getATSTemplates(): Promise<any[]> {
    // Return mock ATS-friendly templates
    return [
      {
        id: 'ats-basic',
        name: 'ATS Basic',
        description: 'Simple, ATS-friendly template',
        compatibility: 0.95
      },
      {
        id: 'ats-professional',
        name: 'ATS Professional',
        description: 'Professional ATS-optimized template',
        compatibility: 0.92
      }
    ];
  }

  /**
   * Generate relevant keywords for ATS optimization
   */
  async generateKeywords(industry: string, role: string): Promise<string[]> {
    // Mock keyword generation based on industry and role
    const baseKeywords = ['communication', 'leadership', 'problem solving', 'teamwork'];
    
    const industryKeywords: Record<string, string[]> = {
      'technology': ['software development', 'agile', 'scrum', 'javascript', 'python', 'aws'],
      'marketing': ['digital marketing', 'seo', 'social media', 'analytics', 'campaigns'],
      'finance': ['financial analysis', 'excel', 'reporting', 'compliance', 'risk management']
    };
    
    const roleKeywords: Record<string, string[]> = {
      'manager': ['team management', 'strategic planning', 'budget management'],
      'developer': ['software development', 'coding', 'debugging', 'testing'],
      'analyst': ['data analysis', 'reporting', 'research', 'insights']
    };
    
    return [
      ...baseKeywords,
      ...(industryKeywords[industry.toLowerCase()] || []),
      ...(roleKeywords[role.toLowerCase()] || [])
    ];
  }
}

export const atsOptimizationService = new ATSOptimizationService();