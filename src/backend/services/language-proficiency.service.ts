// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Language Proficiency Visualization Service
 * Creates visual representations of language skills
 */

import { ParsedCV } from '../../types/enhanced-models';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { config } from '@cvplus/core/config';

export interface LanguageProficiency {
  name: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'limited' | 'elementary';
  score?: number; // 0-100
  certifications?: string[];
  yearsOfExperience?: number;
  contexts?: string[]; // Business, Technical, Academic, etc.
  verified?: boolean;
  flag?: string; // Country flag emoji
  frameworks?: {
    cefr?: string;
    actfl?: string;
    custom?: string;
  };
}

export interface LanguageVisualization {
  proficiencies: LanguageProficiency[];
  visualizations: {
    type: 'circular' | 'bar' | 'radar' | 'flags' | 'matrix';
    data: any;
    config: {
      primaryColor: string;
      accentColor: string;
      showCertifications: boolean;
      showFlags: boolean;
      animateOnLoad: boolean;
    };
  }[];
  insights: {
    totalLanguages: number;
    fluentLanguages: number;
    businessReady: string[];
    certifiedLanguages: string[];
    recommendations: string[];
  };
  metadata: {
    extractedFrom: string[];
    confidence: number;
    lastUpdated: Date;
  };
}

export class LanguageProficiencyService {
  private openai: OpenAI;
  
  // Language to country flag mapping
  private languageFlags: Record<string, string> = {
    'English': '🇬🇧',
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Portuguese': '🇵🇹',
    'Russian': '🇷🇺',
    'Chinese': '🇨🇳',
    'Japanese': '🇯🇵',
    'Korean': '🇰🇷',
    'Arabic': '🇸🇦',
    'Hindi': '🇮🇳',
    'Dutch': '🇳🇱',
    'Swedish': '🇸🇪',
    'Polish': '🇵🇱',
    'Turkish': '🇹🇷',
    'Hebrew': '🇮🇱',
    'Greek': '🇬🇷',
    'Danish': '🇩🇰',
    'Norwegian': '🇳🇴',
    'Finnish': '🇫🇮',
    'Czech': '🇨🇿',
    'Hungarian': '🇭🇺',
    'Romanian': '🇷🇴',
    'Vietnamese': '🇻🇳',
    'Thai': '🇹🇭',
    'Indonesian': '🇮🇩',
    'Malay': '🇲🇾',
    'Filipino': '🇵🇭',
    'Ukrainian': '🇺🇦'
  };

  // Common proficiency frameworks
  private proficiencyFrameworks = {
    CEFR: {
      'native': 'C2+',
      'fluent': 'C2',
      'professional': 'C1',
      'limited': 'B2',
      'elementary': 'A2-B1'
    },
    ACTFL: {
      'native': 'Distinguished',
      'fluent': 'Superior',
      'professional': 'Advanced High',
      'limited': 'Intermediate High',
      'elementary': 'Intermediate Low'
    }
  };

  // Proficiency level to score mapping
  private proficiencyScores = {
    'native': 100,
    'fluent': 90,
    'professional': 70,
    'limited': 50,
    'elementary': 30
  };
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai?.apiKey || process.env.OPENAI_API_KEY || ''
    });
  }
  
  /**
   * Generate language proficiency visualization from CV
   */
  async generateLanguageVisualization(
    parsedCV: ParsedCV, 
    jobId: string
  ): Promise<LanguageVisualization> {
    // Extract language information from CV
    const extractedLanguages = await this.extractLanguages(parsedCV);
    
    // Enhance with AI analysis
    const enhancedProficiencies = await this.enhanceLanguageProficiencies(
      extractedLanguages, 
      parsedCV
    );
    
    // Generate visualizations
    const visualizations = this.generateVisualizations(enhancedProficiencies);
    
    // Generate insights
    const insights = this.generateInsights(enhancedProficiencies);
    
    const visualization: LanguageVisualization = {
      proficiencies: enhancedProficiencies,
      visualizations,
      insights,
      metadata: {
        extractedFrom: this.identifyDataSources(parsedCV),
        confidence: this.calculateConfidence(enhancedProficiencies),
        lastUpdated: new Date()
      }
    };
    
    // Sanitize the entire visualization before storing
    const sanitizedVisualization = this.sanitizeForFirestore(visualization);
    
    // Store in Firestore
    await this.storeVisualization(jobId, sanitizedVisualization);
    
    return sanitizedVisualization;
  }
  
  /**
   * Extract language information from CV
   */
  private async extractLanguages(cv: ParsedCV): Promise<LanguageProficiency[]> {
    const languages: LanguageProficiency[] = [];
    
    // Check skills section for languages
    if (cv.skills && !Array.isArray(cv.skills)) {
      const skillsObj = cv.skills as { technical: string[]; soft: string[]; languages?: string[]; tools?: string[]; };
      if (skillsObj.languages && Array.isArray(skillsObj.languages)) {
        for (const lang of skillsObj.languages) {
          const parsed = this.parseLanguageString(lang);
          if (parsed) {
            languages.push(parsed);
          }
        }
      }
    }
    
    // Use AI to extract languages from other sections
    const prompt = `Extract language proficiencies from this CV content. Look for:
    - Explicit language skills mentions
    - Work experience in multilingual environments
    - International experience suggesting language use
    - Education in foreign languages
    - Certifications (TOEFL, DELE, DELF, etc.)
    
    CV Summary: ${cv.personalInfo?.summary || ''}
    Experience: ${JSON.stringify(cv.experience?.slice(0, 3) || [])}
    Education: ${JSON.stringify(cv.education || [])}
    Certifications: ${JSON.stringify(cv.certifications || [])}
    
    Return as JSON array with: language, level, certifications, contexts`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a language proficiency analyzer. Extract language skills and return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      
      const result = JSON.parse(response.choices?.[0]?.message?.content || '{"languages":[]}');
      const aiLanguages = result.languages || [];
      
      // Merge AI findings with extracted languages
      for (const aiLang of aiLanguages) {
        const existing = languages.find(l => 
          l.name.toLowerCase() === aiLang.language.toLowerCase()
        );
        
        if (!existing) {
          const proficiency = this.normalizeLevel(aiLang.level);
          languages.push({
            name: aiLang.language,
            proficiency,
            score: this.proficiencyScores[proficiency],
            certifications: aiLang.certifications,
            contexts: aiLang.contexts,
            flag: this.languageFlags[aiLang.language] || '🌐',
            frameworks: {
              cefr: this.proficiencyFrameworks.CEFR[proficiency],
              actfl: this.proficiencyFrameworks.ACTFL[proficiency]
            }
          });
        } else {
          // Enhance existing entry
          if (aiLang.certifications) {
            existing.certifications = [
              ...(existing.certifications || []),
              ...aiLang.certifications
            ];
          }
          if (aiLang.contexts) {
            existing.contexts = [
              ...(existing.contexts || []),
              ...aiLang.contexts
            ];
          }
        }
      }
    } catch (error) {
    }
    
    // Always include native language if identifiable
    if (languages.length === 0 || !languages.find(l => l.proficiency === 'native')) {
      const nativeLanguage = this.inferNativeLanguage(cv);
      if (nativeLanguage && !languages.find(l => l.name === nativeLanguage)) {
        languages.unshift({
          name: nativeLanguage,
          proficiency: 'native',
          score: 100,
          flag: this.languageFlags[nativeLanguage] || '🌐',
          frameworks: {
            cefr: this.proficiencyFrameworks.CEFR['native'],
            actfl: this.proficiencyFrameworks.ACTFL['native']
          }
        });
      }
    }
    
    return languages;
  }
  
  /**
   * Parse language string (e.g., "Spanish (Fluent)", "French - B2")
   */
  private parseLanguageString(langString: string): LanguageProficiency | null {
    const patterns = [
      /^(.+?)\s*[\(\-]\s*(.+?)\s*[\)]?$/,  // Language (Level) or Language - Level
      /^(.+?):\s*(.+)$/,                     // Language: Level
      /^(.+?)\s+(.+)$/                       // Language Level
    ];
    
    for (const pattern of patterns) {
      const match = langString.match(pattern);
      if (match) {
        const name = match[1]?.trim() || '';
        const levelStr = match[2]?.trim() || '';
        const proficiency = this.normalizeLevel(levelStr);
        
        return {
          name,
          proficiency,
          score: this.proficiencyScores[proficiency],
          flag: this.languageFlags[name] || '🌐',
          frameworks: {
            cefr: this.proficiencyFrameworks.CEFR[proficiency],
            actfl: this.proficiencyFrameworks.ACTFL[proficiency]
          }
        };
      }
    }
    
    // If no pattern matches, assume it's just the language name
    const proficiency = 'professional'; // Default assumption
    return {
      name: langString.trim(),
      proficiency,
      score: this.proficiencyScores[proficiency],
      flag: this.languageFlags[langString.trim()] || '🌐',
      frameworks: {
        cefr: this.proficiencyFrameworks.CEFR[proficiency],
        actfl: this.proficiencyFrameworks.ACTFL[proficiency]
      }
    };
  }
  
  /**
   * Normalize proficiency level
   */
  private normalizeLevel(levelStr: string): LanguageProficiency['proficiency'] {
    const normalized = levelStr.toLowerCase();
    
    if (normalized.includes('native') || normalized.includes('mother')) {
      return 'native';
    }
    if (normalized.includes('fluent') || normalized.includes('c2') || 
        normalized.includes('superior') || normalized.includes('excellent')) {
      return 'fluent';
    }
    if (normalized.includes('professional') || normalized.includes('c1') ||
        normalized.includes('advanced') || normalized.includes('proficient')) {
      return 'professional';
    }
    if (normalized.includes('conversational') || normalized.includes('b2') ||
        normalized.includes('intermediate') || normalized.includes('good') ||
        normalized.includes('limited')) {
      return 'limited';
    }
    if (normalized.includes('basic') || normalized.includes('beginner') ||
        normalized.includes('a1') || normalized.includes('a2') || 
        normalized.includes('elementary')) {
      return 'elementary';
    }
    
    return 'professional'; // Default
  }
  
  /**
   * Convert level to numeric score
   */
  private levelToScore(_level: LanguageProficiency['proficiency']): number {
    return this.proficiencyScores[_level] || 50;
  }
  
  /**
   * Enhance language proficiencies with AI
   */
  private async enhanceLanguageProficiencies(
    languages: LanguageProficiency[],
    cv: ParsedCV
  ): Promise<LanguageProficiency[]> {
    // Add years of experience based on work history
    for (const lang of languages) {
      lang.yearsOfExperience = this.estimateYearsOfExperience(lang, cv);
      
      // Verify certifications
      if (cv.certifications) {
        const relatedCerts = cv.certifications.filter((cert: any) => 
          this.isLanguageCertification(cert.name, lang.name)
        );
        if (relatedCerts.length > 0) {
          lang.certifications = relatedCerts.map((c: any) => c.name);
          lang.verified = true;
        }
      }
    }
    
    return languages.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  
  /**
   * Sanitize data for Firestore compatibility
   */
  private sanitizeForFirestore(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj
        .map(item => this.sanitizeForFirestore(item))
        .filter(item => item !== null && item !== undefined);
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Explicitly check for undefined values and delete them
        if (value === undefined) {
          delete sanitized[key];
          continue;
        }
        
        const sanitizedValue = this.sanitizeForFirestore(value);
        if (sanitizedValue !== null && sanitizedValue !== undefined) {
          sanitized[key] = sanitizedValue;
        }
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Generate visualizations for language proficiencies
   */
  private generateVisualizations(
    proficiencies: LanguageProficiency[]
  ): LanguageVisualization['visualizations'] {
    const visualizations: LanguageVisualization['visualizations'] = [];
    
    // 1. Circular Progress Visualization
    visualizations.push({
      type: 'circular',
      data: {
        languages: proficiencies.map(p => ({
          name: p.name,
          value: p.score,
          level: p.proficiency,
          flag: p.flag,
          certified: (p.certifications?.length || 0) > 0
        }))
      },
      config: {
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        showCertifications: true,
        showFlags: true,
        animateOnLoad: true
      }
    });
    
    // 2. Horizontal Bar Chart
    visualizations.push({
      type: 'bar',
      data: {
        labels: proficiencies.map(p => `${p.flag} ${p.name}`),
        datasets: [{
          label: 'Proficiency Level',
          data: proficiencies.map(p => p.score || this.proficiencyScores[p.proficiency]),
          backgroundColor: proficiencies.map(p => 
            p.proficiency === 'native' ? '#10B981' :
            p.proficiency === 'fluent' ? '#3B82F6' :
            p.proficiency === 'professional' ? '#8B5CF6' :
            p.proficiency === 'limited' ? '#F59E0B' :
            '#6B7280'
          )
        }]
      },
      config: {
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        showCertifications: true,
        showFlags: true,
        animateOnLoad: true
      }
    });
    
    // 3. Radar Chart (for top 6 languages)
    if (proficiencies.length >= 3) {
      visualizations.push({
        type: 'radar',
        data: {
          labels: proficiencies.slice(0, 6).map(p => p.name),
          datasets: [{
            label: 'Language Proficiency',
            data: proficiencies.slice(0, 6).map(p => p.score || this.proficiencyScores[p.proficiency]),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)'
          }]
        },
        config: {
          primaryColor: '#3B82F6',
          accentColor: '#10B981',
          showCertifications: false,
          showFlags: false,
          animateOnLoad: true
        }
      });
    }
    
    // 4. Flag Grid Visualization
    visualizations.push({
      type: 'flags',
      data: {
        languages: proficiencies.map(p => ({
          flag: p.flag,
          name: p.name,
          level: p.proficiency,
          levelText: this.proficiencyFrameworks.CEFR[p.proficiency],
          certified: p.verified,
          certifications: p.certifications
        }))
      },
      config: {
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        showCertifications: true,
        showFlags: true,
        animateOnLoad: true
      }
    });
    
    // 5. Proficiency Matrix
    visualizations.push({
      type: 'matrix',
      data: {
        languages: proficiencies.map(p => p.name),
        skills: ['Speaking', 'Writing', 'Reading', 'Listening'],
        values: proficiencies.map(p => {
          // Estimate sub-skills based on overall level
          const base = p.score;
          return {
            language: p.name,
            skills: {
              'Speaking': (base || 70) - 5 + Math.random() * 10,
              'Writing': (base || 70) - 5 + Math.random() * 10,
              'Reading': (base || 70) + Math.random() * 5,
              'Listening': (base || 70) - 2 + Math.random() * 7
            }
          };
        })
      },
      config: {
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        showCertifications: false,
        showFlags: false,
        animateOnLoad: true
      }
    });
    
    // Sanitize all visualizations to prevent undefined values in Firestore
    return this.sanitizeForFirestore(visualizations);
  }
  
  /**
   * Generate insights from language proficiencies
   */
  private generateInsights(
    proficiencies: LanguageProficiency[]
  ): LanguageVisualization['insights'] {
    const fluentLanguages = proficiencies.filter(p => 
      p.proficiency === 'native' || p.proficiency === 'fluent'
    );
    
    const businessReady = proficiencies.filter(p => 
      (p.score || 0) >= 70 && p.contexts?.some(c => 
        c.toLowerCase().includes('business') || 
        c.toLowerCase().includes('professional')
      )
    ).map(p => p.name);
    
    const certifiedLanguages = proficiencies.filter(p => 
      p.certifications && p.certifications.length > 0
    ).map(p => p.name);
    
    const recommendations: string[] = [];
    
    // Generate recommendations
    if (proficiencies.length === 1) {
      recommendations.push('Consider learning a second language to enhance global opportunities');
    }
    
    if (certifiedLanguages.length === 0 && proficiencies.length > 1) {
      recommendations.push('Consider obtaining language certifications to validate your skills');
    }
    
    const conversationalLanguages = proficiencies.filter(p => p.proficiency === 'limited');
    if (conversationalLanguages.length > 0) {
      recommendations.push(
        `Improve ${conversationalLanguages[0]?.name || 'language skills'} to professional level for career advancement`
      );
    }
    
    if (!proficiencies.find(p => p.name === 'English') && proficiencies.length > 0) {
      recommendations.push('Consider adding English for broader international opportunities');
    }
    
    return {
      totalLanguages: proficiencies.length,
      fluentLanguages: fluentLanguages.length,
      businessReady,
      certifiedLanguages,
      recommendations
    };
  }
  
  /**
   * Identify data sources for language extraction
   */
  private identifyDataSources(cv: ParsedCV): string[] {
    const sources: string[] = [];
    
    if (cv.skills && !Array.isArray(cv.skills)) {
      const skillsObj = cv.skills as { technical: string[]; soft: string[]; languages?: string[]; tools?: string[]; };
      if (skillsObj.languages && skillsObj.languages.length > 0) {
        sources.push('Skills section');
      }
    }
    
    if (cv.certifications?.some((c: any) => this.isLanguageCertification(c.name))) {
      sources.push('Certifications');
    }
    
    if (cv.experience?.some((exp: any) => 
      exp.description?.toLowerCase().includes('language') ||
      exp.description?.toLowerCase().includes('multilingual') ||
      exp.description?.toLowerCase().includes('international')
    )) {
      sources.push('Work experience');
    }
    
    if (cv.education?.some((edu: any) => 
      edu.field?.toLowerCase().includes('language') ||
      edu.field?.toLowerCase().includes('linguistics')
    )) {
      sources.push('Education');
    }
    
    return sources.length > 0 ? sources : ['AI inference'];
  }
  
  /**
   * Calculate confidence score
   */
  private calculateConfidence(proficiencies: LanguageProficiency[]): number {
    let confidence = 50; // Base confidence
    
    // Increase for certified languages
    const certifiedCount = proficiencies.filter(p => p.verified).length;
    confidence += certifiedCount * 10;
    
    // Increase for languages with contexts
    const contextCount = proficiencies.filter(p => p.contexts && p.contexts.length > 0).length;
    confidence += contextCount * 5;
    
    // Cap at 95
    return Math.min(confidence, 95);
  }
  
  /**
   * Estimate years of experience with a language
   */
  private estimateYearsOfExperience(
    language: LanguageProficiency,
    cv: ParsedCV
  ): number {
    if (language.proficiency === 'native') {
      // Estimate based on age (if available) or professional experience
      const totalExperience = cv.experience?.reduce((sum: any, exp: any) => {
        const start = new Date(exp.startDate || 0);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        return sum + (end.getFullYear() - start.getFullYear());
      }, 0) || 0;
      
      return Math.max(20, totalExperience + 5); // Assume native from childhood
    }
    
    // Look for language mentions in experience
    let years = 0;
    cv.experience?.forEach((exp: any) => {
      if (exp.description?.toLowerCase().includes(language.name.toLowerCase()) ||
          exp.company?.toLowerCase().includes(language.name.toLowerCase())) {
        const start = new Date(exp.startDate || 0);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        years += (end.getFullYear() - start.getFullYear());
      }
    });
    
    // Minimum years based on level
    const minYears = {
      'fluent': 5,
      'professional': 3,
      'limited': 2,
      'elementary': 1
    };
    
    return Math.max(years, minYears[language.proficiency] || 0);
  }
  
  /**
   * Check if certification is language-related
   */
  private isLanguageCertification(certName: string, language?: string): boolean {
    const languageCerts = [
      'TOEFL', 'IELTS', 'TOEIC', 'Cambridge', 'DELE', 'DELF', 'DALF',
      'TestDaF', 'Goethe', 'JLPT', 'HSK', 'TOPIK', 'CELI', 'CILS',
      'TORFL', 'SIELE', 'OPI', 'ACTFL', 'telc', 'ÖSD'
    ];
    
    const certLower = certName.toLowerCase();
    const hasLanguageCert = languageCerts.some(cert => 
      certLower.includes(cert.toLowerCase())
    );
    
    if (language) {
      return hasLanguageCert || certLower.includes(language.toLowerCase());
    }
    
    return hasLanguageCert;
  }
  
  /**
   * Infer native language from CV context
   */
  private inferNativeLanguage(cv: ParsedCV): string | null {
    // Check for location clues
    const location = cv.personalInfo?.address?.toLowerCase() || '';
    
    // Simple location to language mapping
    if (location.includes('usa') || location.includes('united states') || 
        location.includes('uk') || location.includes('england') ||
        location.includes('canada') || location.includes('australia')) {
      return 'English';
    }
    if (location.includes('spain') || location.includes('mexico') || 
        location.includes('argentina')) {
      return 'Spanish';
    }
    if (location.includes('france')) return 'French';
    if (location.includes('germany')) return 'German';
    if (location.includes('italy')) return 'Italian';
    if (location.includes('china')) return 'Chinese';
    if (location.includes('japan')) return 'Japanese';
    if (location.includes('korea')) return 'Korean';
    if (location.includes('brazil') || location.includes('portugal')) return 'Portuguese';
    if (location.includes('russia')) return 'Russian';
    if (location.includes('india')) return 'Hindi';
    
    // Default to English if unclear
    return 'English';
  }
  
  /**
   * Store visualization in Firestore
   */
  private async storeVisualization(
    jobId: string, 
    visualization: LanguageVisualization
  ): Promise<void> {
    await admin.firestore()
      .collection('jobs')
      .doc(jobId)
      .update({
        'enhancedFeatures.languageProficiency': {
          enabled: true,
          status: 'completed',
          data: visualization,
          generatedAt: FieldValue.serverTimestamp()
        }
      });
  }
  
  /**
   * Update language proficiency
   */
  async updateLanguageProficiency(
    jobId: string,
    languageId: string,
    updates: Partial<LanguageProficiency>
  ): Promise<LanguageProficiency> {
    const jobDoc = await admin.firestore()
      .collection('jobs')
      .doc(jobId)
      .get();
    
    const data = jobDoc.data();
    const visualization = data?.enhancedFeatures?.languageProficiency?.data as LanguageVisualization;
    
    if (!visualization) {
      throw new Error('Language visualization not found');
    }
    
    const langIndex = visualization.proficiencies.findIndex(p => 
      p.name === languageId
    );
    
    if (langIndex === -1) {
      throw new Error('Language not found');
    }
    
    // Update the language
    const proficiency = {
      name: visualization.proficiencies[langIndex]?.name || 'Unknown',
      proficiency: visualization.proficiencies[langIndex]?.proficiency || 'elementary',
      score: visualization.proficiencies[langIndex]?.score,
      certifications: visualization.proficiencies[langIndex]?.certifications,
      yearsOfExperience: visualization.proficiencies[langIndex]?.yearsOfExperience,
      contexts: visualization.proficiencies[langIndex]?.contexts,
      verified: visualization.proficiencies[langIndex]?.verified,
      flag: visualization.proficiencies[langIndex]?.flag,
      frameworks: visualization.proficiencies[langIndex]?.frameworks,
      ...updates
    };
    visualization.proficiencies[langIndex] = proficiency;
    
    // Regenerate visualizations
    visualization.visualizations = this.generateVisualizations(visualization.proficiencies);
    
    // Update insights
    visualization.insights = this.generateInsights(visualization.proficiencies);
    
    // Save
    await admin.firestore()
      .collection('jobs')
      .doc(jobId)
      .update({
        'enhancedFeatures.languageProficiency.data': visualization,
        'enhancedFeatures.languageProficiency.lastModified': FieldValue.serverTimestamp()
      });
    
    return visualization.proficiencies[langIndex] || proficiency;
  }
}

export const languageProficiencyService = new LanguageProficiencyService();