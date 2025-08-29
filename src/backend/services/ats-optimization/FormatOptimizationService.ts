/**
 * Format Optimization Service
 * 
 * Specialized service for CV format optimization, ATS-friendly templates,
 * and structure recommendations for better parsing compatibility.
 */

import { ParsedCV } from '../../types/enhanced-models';

interface ATSTemplate {
  id: string;
  name: string;
  industry?: string;
  role?: string;
  description: string;
  features: string[];
  compatibility: {
    workday: number;
    greenhouse: number;
    lever: number;
    smartrecruiters: number;
    bamboohr: number;
    icims: number;
  };
  structure: {
    sections: string[];
    sectionOrder: string[];
    formatting: {
      fonts: string[];
      headings: string;
      bullets: string;
      spacing: string;
    };
  };
}

export class FormatOptimizationService {

  /**
   * Get ATS-optimized templates based on industry and role
   */
  async getATSTemplates(industry?: string, role?: string): Promise<ATSTemplate[]> {
    const allTemplates = this.getTemplateLibrary();
    
    // Filter templates based on industry and role
    let filteredTemplates = allTemplates;
    
    if (industry) {
      filteredTemplates = filteredTemplates.filter(template => 
        !template.industry || 
        template.industry === industry ||
        template.industry === 'universal'
      );
    }
    
    if (role) {
      filteredTemplates = filteredTemplates.filter(template =>
        !template.role ||
        template.role === role ||
        template.role.includes('universal')
      );
    }
    
    // Sort by overall ATS compatibility
    return filteredTemplates.sort((a, b) => {
      const avgCompatibilityA = this.calculateAverageCompatibility(a.compatibility);
      const avgCompatibilityB = this.calculateAverageCompatibility(b.compatibility);
      return avgCompatibilityB - avgCompatibilityA;
    });
  }

  /**
   * Analyze current CV format and provide optimization recommendations
   */
  analyzeFormatCompatibility(parsedCV: ParsedCV): {
    overallScore: number;
    issues: string[];
    recommendations: string[];
    bestTemplates: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze section structure
    const sectionIssues = this.analyzeSectionStructure(parsedCV);
    issues.push(...sectionIssues);
    
    // Analyze formatting consistency
    const formatIssues = this.analyzeFormattingConsistency(parsedCV);
    issues.push(...formatIssues);
    
    // Analyze ATS-friendly elements
    const atsIssues = this.analyzeATSFriendliness(parsedCV);
    issues.push(...atsIssues);
    
    // Generate recommendations based on issues
    recommendations.push(...this.generateFormatRecommendations(issues));
    
    // Calculate overall format score
    const overallScore = this.calculateFormatScore(parsedCV, issues);
    
    // Recommend best templates
    const bestTemplates = this.recommendTemplatesForCV(parsedCV);
    
    return {
      overallScore,
      issues,
      recommendations,
      bestTemplates
    };
  }

  /**
   * Get template library with ATS-optimized formats
   */
  private getTemplateLibrary(): ATSTemplate[] {
    return [
      {
        id: 'ats-professional',
        name: 'ATS Professional',
        industry: 'universal',
        role: 'universal',
        description: 'Clean, professional template optimized for maximum ATS compatibility',
        features: [
          'Standard section headers',
          'Consistent formatting',
          'ATS-friendly fonts',
          'Proper white space',
          'Contact info optimization'
        ],
        compatibility: {
          workday: 95,
          greenhouse: 92,
          lever: 90,
          smartrecruiters: 94,
          bamboohr: 96,
          icims: 88
        },
        structure: {
          sections: ['personalInfo', 'summary', 'experience', 'education', 'skills', 'certifications'],
          sectionOrder: ['personalInfo', 'summary', 'experience', 'skills', 'education', 'certifications'],
          formatting: {
            fonts: ['Arial', 'Calibri', 'Times New Roman'],
            headings: 'Bold, 14-16pt',
            bullets: 'Simple bullet points (•)',
            spacing: '1.15 line spacing, proper margins'
          }
        }
      },
      {
        id: 'tech-optimized',
        name: 'Technical Professional',
        industry: 'technology',
        role: 'universal',
        description: 'Technology-focused template with emphasis on technical skills and projects',
        features: [
          'Technical skills prominence',
          'Project showcases',
          'Programming languages section',
          'Clean code structure',
          'GitHub/portfolio integration'
        ],
        compatibility: {
          workday: 90,
          greenhouse: 95,
          lever: 92,
          smartrecruiters: 88,
          bamboohr: 85,
          icims: 93
        },
        structure: {
          sections: ['personalInfo', 'summary', 'technicalSkills', 'experience', 'projects', 'education', 'certifications'],
          sectionOrder: ['personalInfo', 'summary', 'technicalSkills', 'experience', 'projects', 'education', 'certifications'],
          formatting: {
            fonts: ['Calibri', 'Arial', 'Helvetica'],
            headings: 'Bold, 14pt',
            bullets: 'Simple bullets with sub-bullets for details',
            spacing: '1.0 line spacing, compact layout'
          }
        }
      },
      {
        id: 'executive-standard',
        name: 'Executive Standard',
        industry: 'universal',
        role: 'executive',
        description: 'Executive-level template focusing on leadership and strategic achievements',
        features: [
          'Leadership emphasis',
          'Strategic achievements',
          'Board experience',
          'P&L responsibility',
          'Executive summary focus'
        ],
        compatibility: {
          workday: 92,
          greenhouse: 90,
          lever: 94,
          smartrecruiters: 91,
          bamboohr: 89,
          icims: 87
        },
        structure: {
          sections: ['personalInfo', 'executiveSummary', 'coreCompetencies', 'experience', 'education', 'boardPositions'],
          sectionOrder: ['personalInfo', 'executiveSummary', 'coreCompetencies', 'experience', 'education', 'boardPositions'],
          formatting: {
            fonts: ['Times New Roman', 'Arial', 'Calibri'],
            headings: 'Bold, 16pt for main headings, 12pt for subheadings',
            bullets: 'Professional bullet points with metrics',
            spacing: '1.15 line spacing, executive margins'
          }
        }
      },
      {
        id: 'healthcare-compliant',
        name: 'Healthcare Compliant',
        industry: 'healthcare',
        role: 'universal',
        description: 'Healthcare industry template emphasizing compliance and patient care',
        features: [
          'Certification prominence',
          'Compliance focus',
          'Patient care metrics',
          'Medical terminology',
          'Continuing education'
        ],
        compatibility: {
          workday: 88,
          greenhouse: 91,
          lever: 89,
          smartrecruiters: 93,
          bamboohr: 90,
          icims: 86
        },
        structure: {
          sections: ['personalInfo', 'summary', 'licenses', 'experience', 'education', 'certifications', 'continuingEducation'],
          sectionOrder: ['personalInfo', 'summary', 'licenses', 'experience', 'education', 'certifications', 'continuingEducation'],
          formatting: {
            fonts: ['Arial', 'Calibri'],
            headings: 'Bold, standard sizing',
            bullets: 'Simple bullets with compliance focus',
            spacing: '1.15 line spacing, professional margins'
          }
        }
      },
      {
        id: 'finance-standard',
        name: 'Finance Professional',
        industry: 'finance',
        role: 'universal',
        description: 'Finance industry template with emphasis on quantified achievements',
        features: [
          'Financial metrics emphasis',
          'Regulatory compliance',
          'Risk management focus',
          'Audit experience',
          'Financial certifications'
        ],
        compatibility: {
          workday: 94,
          greenhouse: 89,
          lever: 91,
          smartrecruiters: 90,
          bamboohr: 92,
          icims: 88
        },
        structure: {
          sections: ['personalInfo', 'summary', 'coreCompetencies', 'experience', 'education', 'certifications', 'technicalSkills'],
          sectionOrder: ['personalInfo', 'summary', 'coreCompetencies', 'experience', 'education', 'certifications', 'technicalSkills'],
          formatting: {
            fonts: ['Times New Roman', 'Arial'],
            headings: 'Bold, conservative styling',
            bullets: 'Quantified bullet points with financial metrics',
            spacing: '1.0 line spacing, conservative margins'
          }
        }
      },
      {
        id: 'creative-ats',
        name: 'Creative ATS-Friendly',
        industry: 'marketing',
        role: 'creative',
        description: 'Creative template that maintains ATS compatibility',
        features: [
          'Portfolio integration',
          'Campaign highlights',
          'Creative achievements',
          'Brand experience',
          'Multi-media projects'
        ],
        compatibility: {
          workday: 85,
          greenhouse: 92,
          lever: 88,
          smartrecruiters: 87,
          bamboohr: 84,
          icims: 90
        },
        structure: {
          sections: ['personalInfo', 'summary', 'portfolio', 'experience', 'skills', 'education', 'achievements'],
          sectionOrder: ['personalInfo', 'summary', 'portfolio', 'experience', 'skills', 'education', 'achievements'],
          formatting: {
            fonts: ['Calibri', 'Arial', 'Helvetica'],
            headings: 'Bold with subtle styling',
            bullets: 'Creative but clean bullet points',
            spacing: '1.15 line spacing with visual breaks'
          }
        }
      }
    ];
  }

  /**
   * Analyze section structure for ATS compatibility
   */
  private analyzeSectionStructure(parsedCV: ParsedCV): string[] {
    const issues: string[] = [];
    
    // Check for essential sections
    const essentialSections = ['personalInfo', 'experience'];
    essentialSections.forEach(section => {
      if (!this.hasValidSection(parsedCV, section)) {
        issues.push(`Missing essential section: ${section}`);
      }
    });
    
    // Check for recommended sections
    const recommendedSections = ['education', 'skills'];
    recommendedSections.forEach(section => {
      if (!this.hasValidSection(parsedCV, section)) {
        issues.push(`Missing recommended section: ${section}`);
      }
    });
    
    // Check section completeness
    if (parsedCV.experience) {
      const incompleteExperience = parsedCV.experience.filter(exp => 
        !exp.role || !exp.company || !exp.description
      );
      if (incompleteExperience.length > 0) {
        issues.push(`${incompleteExperience.length} experience entries are incomplete`);
      }
    }
    
    return issues;
  }

  /**
   * Analyze formatting consistency
   */
  private analyzeFormattingConsistency(parsedCV: ParsedCV): string[] {
    const issues: string[] = [];
    
    // Check date consistency
    const dates = this.extractAllDates(parsedCV);
    if (dates.length > 1) {
      const formats = dates.map(date => this.getDateFormat(date));
      if (new Set(formats).size > 1) {
        issues.push('Inconsistent date formatting detected');
      }
    }
    
    // Check contact information formatting
    if (parsedCV.personalInfo?.email && !this.isValidEmail(parsedCV.personalInfo.email)) {
      issues.push('Email format appears invalid');
    }
    
    // Check for missing contact elements
    if (!parsedCV.personalInfo?.phone) {
      issues.push('Phone number missing from contact information');
    }
    
    return issues;
  }

  /**
   * Analyze ATS-friendly elements
   */
  private analyzeATSFriendliness(parsedCV: ParsedCV): string[] {
    const issues: string[] = [];
    
    // Check for complex formatting indicators
    // Note: This is limited since we're working with parsed data
    
    // Check for proper section headers (inferred from structure)
    if (!parsedCV.personalInfo) {
      issues.push('Contact information section not properly structured');
    }
    
    // Check for skills organization
    if (parsedCV.skills) {
      if (Array.isArray(parsedCV.skills)) {
        if (parsedCV.skills.length > 50) {
          issues.push('Too many individual skills listed - consider grouping by category');
        }
      }
    }
    
    // Check experience descriptions length
    if (parsedCV.experience) {
      const longDescriptions = parsedCV.experience.filter(exp => 
        exp.description && exp.description.length > 1000
      );
      if (longDescriptions.length > 0) {
        issues.push('Some experience descriptions may be too lengthy');
      }
    }
    
    return issues;
  }

  /**
   * Generate format recommendations based on issues
   */
  private generateFormatRecommendations(issues: string[]): string[] {
    const recommendations: string[] = [];
    
    issues.forEach(issue => {
      if (issue.includes('Missing essential section')) {
        recommendations.push('Add all essential sections for complete ATS parsing');
      } else if (issue.includes('date formatting')) {
        recommendations.push('Standardize all dates to MM/YYYY format');
      } else if (issue.includes('Email format')) {
        recommendations.push('Ensure email address follows standard format');
      } else if (issue.includes('Phone number missing')) {
        recommendations.push('Add phone number to contact information');
      } else if (issue.includes('experience entries are incomplete')) {
        recommendations.push('Complete all experience entries with role, company, and description');
      } else if (issue.includes('too lengthy')) {
        recommendations.push('Consider condensing lengthy sections for better ATS processing');
      }
    });
    
    // Add general recommendations
    recommendations.push('Use standard section headers (Experience, Education, Skills)');
    recommendations.push('Maintain consistent formatting throughout the document');
    recommendations.push('Use simple, ATS-friendly fonts (Arial, Calibri, Times New Roman)');
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Calculate format compatibility score
   */
  private calculateFormatScore(parsedCV: ParsedCV, issues: string[]): number {
    let score = 100;
    
    // Deduct points for each issue
    const severityWeights = {
      'Missing essential section': 20,
      'Missing recommended section': 10,
      'incomplete': 15,
      'formatting': 10,
      'invalid': 10,
      'missing': 5,
      'lengthy': 5
    };
    
    issues.forEach(issue => {
      for (const [key, weight] of Object.entries(severityWeights)) {
        if (issue.toLowerCase().includes(key)) {
          score -= weight;
          break;
        }
      }
    });
    
    return Math.max(score, 0);
  }

  /**
   * Recommend best templates for specific CV
   */
  private recommendTemplatesForCV(parsedCV: ParsedCV): string[] {
    // Note: template library integration pending - using hardcoded recommendations for now
    const recommendations: string[] = [];
    
    // Always recommend the universal professional template
    recommendations.push('ats-professional');
    
    // Recommend based on skills or industry indicators
    const cvText = this.cvToText(parsedCV).toLowerCase();
    
    if (this.containsTechKeywords(cvText)) {
      recommendations.push('tech-optimized');
    }
    
    if (this.containsHealthcareKeywords(cvText)) {
      recommendations.push('healthcare-compliant');
    }
    
    if (this.containsFinanceKeywords(cvText)) {
      recommendations.push('finance-standard');
    }
    
    if (this.containsExecutiveKeywords(cvText)) {
      recommendations.push('executive-standard');
    }
    
    if (this.containsCreativeKeywords(cvText)) {
      recommendations.push('creative-ats');
    }
    
    return recommendations.slice(0, 3); // Top 3 recommendations
  }

  /**
   * Calculate average compatibility score
   */
  private calculateAverageCompatibility(compatibility: any): number {
    const scores = Object.values(compatibility) as number[];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  // Helper methods

  private hasValidSection(parsedCV: ParsedCV, sectionName: string): boolean {
    const section = parsedCV[sectionName as keyof ParsedCV];
    if (!section) return false;
    
    if (Array.isArray(section)) {
      return section.length > 0;
    }
    
    if (typeof section === 'object') {
      return Object.keys(section).length > 0;
    }
    
    return true;
  }

  private extractAllDates(parsedCV: ParsedCV): string[] {
    const dates: string[] = [];
    
    if (parsedCV.experience) {
      parsedCV.experience.forEach(exp => {
        if (exp.startDate) dates.push(exp.startDate);
        if (exp.endDate) dates.push(exp.endDate);
      });
    }
    
    if (parsedCV.education) {
      parsedCV.education.forEach(edu => {
        if (edu.startDate) dates.push(edu.startDate);
        if (edu.endDate) dates.push(edu.endDate);
      });
    }
    
    return dates;
  }

  private getDateFormat(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'YYYY-MM-DD';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return 'MM/DD/YYYY';
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) return 'YYYY/MM/DD';
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/i.test(date)) return 'Mon YYYY';
    if (/^\d{4}$/.test(date)) return 'YYYY';
    return 'unknown';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

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
      cv.education.forEach(edu => {
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

  private containsTechKeywords(text: string): boolean {
    const techKeywords = ['programming', 'developer', 'software', 'api', 'database', 'cloud', 'devops', 'agile'];
    return techKeywords.some(keyword => text.includes(keyword));
  }

  private containsHealthcareKeywords(text: string): boolean {
    const healthKeywords = ['healthcare', 'medical', 'patient', 'clinical', 'hospital', 'nursing', 'physician'];
    return healthKeywords.some(keyword => text.includes(keyword));
  }

  private containsFinanceKeywords(text: string): boolean {
    const financeKeywords = ['financial', 'accounting', 'investment', 'banking', 'finance', 'audit', 'risk'];
    return financeKeywords.some(keyword => text.includes(keyword));
  }

  private containsExecutiveKeywords(text: string): boolean {
    const execKeywords = ['executive', 'ceo', 'cto', 'director', 'vp', 'president', 'leadership', 'strategy'];
    return execKeywords.some(keyword => text.includes(keyword));
  }

  private containsCreativeKeywords(text: string): boolean {
    const creativeKeywords = ['marketing', 'design', 'creative', 'brand', 'campaign', 'content', 'digital'];
    return creativeKeywords.some(keyword => text.includes(keyword));
  }
}