/**
 * Keyword Extractor
 * 
 * Handles keyword extraction, matching, and relevance scoring.
 */

import { KeywordMatch } from '../../../types/enhanced-models';

export class KeywordExtractor {
  
  // Industry-specific keyword mappings
  private readonly industryKeywords = {
    technology: ['AI', 'ML', 'API', 'cloud', 'agile', 'CI/CD', 'DevOps', 'microservices', 'React', 'Python', 'AWS'],
    finance: ['risk management', 'compliance', 'financial modeling', 'portfolio', 'derivatives', 'regulatory', 'audit'],
    healthcare: ['patient care', 'HIPAA', 'medical records', 'clinical', 'healthcare', 'EMR', 'quality assurance'],
    marketing: ['campaign management', 'digital marketing', 'SEO', 'content strategy', 'analytics', 'brand management'],
    sales: ['lead generation', 'CRM', 'pipeline management', 'client acquisition', 'revenue growth', 'negotiation']
  };

  // High-impact action verbs for ATS optimization
  private readonly actionVerbs = [
    'achieved', 'implemented', 'developed', 'managed', 'led', 'created', 'optimized', 
    'improved', 'increased', 'reduced', 'streamlined', 'delivered', 'executed', 
    'collaborated', 'designed', 'analyzed', 'established', 'maintained', 'coordinated'
  ];

  /**
   * Extract and analyze keywords from CV
   */
  extractKeywords(cvText: string, targetKeywords: string[], industry?: string): KeywordMatch[] {
    const matchedKeywords: KeywordMatch[] = [];
    const cvLower = cvText.toLowerCase();
    
    // Analyze target keywords
    for (const keyword of targetKeywords) {
      const keywordLower = keyword.toLowerCase();
      const frequency = (cvText.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
      
      if (frequency > 0) {
        matchedKeywords.push({
          keyword,
          variations: [keyword],
          frequency,
          importance: this.calculateKeywordRelevance(keyword, cvText, industry),
          context: this.extractKeywordContext(keyword, cvText)
        });
      }
    }

    // Analyze industry keywords
    if (industry && this.industryKeywords[industry as keyof typeof this.industryKeywords]) {
      const industryTerms = this.industryKeywords[industry as keyof typeof this.industryKeywords];
      for (const term of industryTerms) {
        if (!targetKeywords.includes(term)) {
          const frequency = (cvLower.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
          if (frequency > 0) {
            matchedKeywords.push({
              keyword: term,
              variations: [term],
              frequency,
              importance: this.calculateKeywordRelevance(term, cvText, industry),
              context: this.extractKeywordContext(term, cvText)
            });
          }
        }
      }
    }

    return matchedKeywords;
  }

  /**
   * Calculate keyword relevance score
   */
  private calculateKeywordRelevance(keyword: string, cvText: string, industry?: string): number {
    let relevance = 0.5; // Base relevance
    
    // Check if keyword appears in important sections
    const importantSections = ['summary', 'experience', 'skills', 'achievements'];
    for (const section of importantSections) {
      if (cvText.toLowerCase().includes(section) && 
          cvText.toLowerCase().includes(keyword.toLowerCase())) {
        relevance += 0.1;
      }
    }

    // Industry-specific boost
    if (industry && this.industryKeywords[industry as keyof typeof this.industryKeywords]?.includes(keyword)) {
      relevance += 0.2;
    }

    // Action verb boost
    if (this.actionVerbs.includes(keyword.toLowerCase())) {
      relevance += 0.1;
    }

    return Math.min(relevance, 1.0);
  }

  /**
   * Extract context where keyword appears
   */
  private extractKeywordContext(keyword: string, cvText: string): string[] {
    const contexts: string[] = [];
    const sentences = cvText.split(/[.!?]+/);
    const keywordLower = keyword.toLowerCase();

    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(keywordLower)) {
        contexts.push(sentence.trim().substring(0, 100) + '...');
        if (contexts.length >= 3) break; // Limit to 3 contexts
      }
    }

    return contexts;
  }

  /**
   * Find semantic variations of matched keywords
   */
  findSemanticVariations(matchedKeywords: KeywordMatch[], cvText: string): string[] {
    const variations: string[] = [];
    
    for (const match of matchedKeywords) {
      const keyword = match.keyword.toLowerCase();
      
      // Simple variation detection (can be enhanced with NLP)
      const words = cvText.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.includes(keyword) && word !== keyword && word.length > keyword.length) {
          variations.push(word);
        }
      }
    }

    return [...new Set(variations)].slice(0, 10); // Dedupe and limit
  }

  /**
   * Get fallback keywords for industry
   */
  getFallbackKeywords(industry?: string, role?: string): string[] {
    const baseKeywords = ['experience', 'management', 'team', 'project', 'development'];
    
    if (industry && this.industryKeywords[industry as keyof typeof this.industryKeywords]) {
      return [
        ...baseKeywords,
        ...this.industryKeywords[industry as keyof typeof this.industryKeywords].slice(0, 10)
      ];
    }

    return baseKeywords;
  }

  /**
   * Get optimal keyword density for industry
   */
  getOptimalKeywordDensity(industry?: string): number {
    const densityMap: { [key: string]: number } = {
      technology: 0.035,
      finance: 0.03,
      healthcare: 0.028,
      marketing: 0.032,
      sales: 0.03
    };

    return industry && densityMap[industry] ? densityMap[industry] : 0.03;
  }
}