// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Fuzzy Matching Service for Role Detection
 * 
 * Provides fuzzy string matching and synonym detection capabilities
 */

import {
  FuzzyMatchConfig,
  levenshteinDistance
} from './role-detection-helpers';

export class FuzzyMatchingService {
  private fuzzyConfig: FuzzyMatchConfig;
  private synonymMap: Map<string, string[]>;
  private abbreviationMap: Map<string, string>;

  constructor(
    fuzzyConfig: FuzzyMatchConfig,
    synonymMap: Map<string, string[]>,
    abbreviationMap: Map<string, string>
  ) {
    this.fuzzyConfig = fuzzyConfig;
    this.synonymMap = synonymMap;
    this.abbreviationMap = abbreviationMap;
  }

  /**
   * Perform fuzzy string matching
   */
  fuzzyMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return true;

    // Check abbreviations
    if (this.fuzzyConfig.enableAbbreviations) {
      const expanded1 = this.abbreviationMap.get(s1) || s1;
      const expanded2 = this.abbreviationMap.get(s2) || s2;
      if (expanded1 === expanded2 || expanded1 === s2 || s1 === expanded2) {
        return true;
      }
    }

    // Calculate similarity
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return true;
    
    const distance = levenshteinDistance(s1, s2);
    const similarity = 1 - (distance / maxLen);

    return similarity >= threshold;
  }

  /**
   * Check if keywords match considering synonyms
   */
  matchWithSynonyms(keyword1: string, keyword2: string): boolean {
    const k1 = keyword1.toLowerCase().trim();
    const k2 = keyword2.toLowerCase().trim();

    // Direct match
    if (k1 === k2) return true;

    // Check synonyms
    if (this.fuzzyConfig.enableSynonyms) {
      for (const [key, synonyms] of this.synonymMap) {
        const allTerms = [key, ...synonyms];
        if (allTerms.includes(k1) && allTerms.includes(k2)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Enhanced keyword matching with fuzzy logic and synonyms
   */
  matchKeywords(
    cvKeywords: string[],
    profileKeywords: string[],
    fuzzyThreshold: number = 0.8
  ): { matches: string[]; score: number } {
    const matchedKeywords: string[] = [];
    
    cvKeywords.forEach(cvKeyword => {
      profileKeywords.forEach(profileKeyword => {
        const cvKw = cvKeyword.toLowerCase().trim();
        const profileKw = profileKeyword.toLowerCase().trim();
        
        // Exact match
        if (cvKw === profileKw) {
          matchedKeywords.push(cvKeyword);
          return;
        }
        
        // Substring match
        if (cvKw.includes(profileKw) || profileKw.includes(cvKw)) {
          matchedKeywords.push(cvKeyword);
          return;
        }
        
        // Synonym match
        if (this.matchWithSynonyms(cvKw, profileKw)) {
          matchedKeywords.push(cvKeyword);
          return;
        }
        
        // Fuzzy match
        if (this.fuzzyMatch(cvKw, profileKw, fuzzyThreshold)) {
          matchedKeywords.push(cvKeyword);
          return;
        }
        
        // Check expanded abbreviations
        const expandedCv = this.abbreviationMap.get(cvKw) || cvKw;
        const expandedProfile = this.abbreviationMap.get(profileKw) || profileKw;
        if (this.fuzzyMatch(expandedCv, expandedProfile, fuzzyThreshold)) {
          matchedKeywords.push(cvKeyword);
        }
      });
    });

    // Remove duplicates
    const uniqueMatches = Array.from(new Set(matchedKeywords));
    
    // Calculate score (percentage of profile keywords matched)
    const baseScore = profileKeywords.length > 0 
      ? Math.min(uniqueMatches.length / profileKeywords.length, 1.0)
      : 0;
    
    // Apply bonus for multiple matches of important keywords
    const bonusScore = uniqueMatches.length > profileKeywords.length * 0.5 ? 0.1 : 0;
    const score = Math.min(baseScore + bonusScore, 1.0);

    return {
      matches: uniqueMatches,
      score
    };
  }
}