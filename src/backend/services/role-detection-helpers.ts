// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Role Detection Helper Functions
 * 
 * Utility functions for fuzzy matching, synonym detection, and seniority analysis
 */

import { ExperienceLevel } from '@cvplus/core/types/role-profile.types';
import { ParsedCV } from '../types/job';

export interface FuzzyMatchConfig {
  threshold: number;
  enableAbbreviations: boolean;
  enableSynonyms: boolean;
}

export interface SeniorityIndicators {
  level: ExperienceLevel;
  yearsOfExperience?: number;
  keywords: string[];
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize the matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Get full text from CV for analysis
 */
export function getCVFullText(parsedCV: ParsedCV): string {
  const texts: string[] = [];
  
  // Add all text content from CV
  if (parsedCV.personalInfo?.title) texts.push(parsedCV.personalInfo.title);
  if (parsedCV.personal?.title) texts.push(parsedCV.personal.title);
  if (parsedCV.summary) texts.push(parsedCV.summary);
  
  if (parsedCV.experience) {
    parsedCV.experience.forEach(exp => {
      texts.push(exp.position, exp.company, exp.description || '');
      if (exp.achievements) texts.push(...exp.achievements);
    });
  }
  
  if (parsedCV.skills) {
    if (Array.isArray(parsedCV.skills)) {
      texts.push(...parsedCV.skills);
    } else {
      texts.push(...Object.values(parsedCV.skills).flat());
    }
  }
  
  return texts.filter(Boolean).join(' ');
}

/**
 * Calculate recency weight for experience
 */
export function calculateRecencyWeight(experienceIndex: number, totalExperiences: number): number {
  // More recent experience (lower index) gets higher weight
  // Weight decreases exponentially for older experiences
  const recencyFactor = Math.exp(-0.3 * experienceIndex);
  return recencyFactor;
}

/**
 * Calculate seniority adjustment factor
 */
export function calculateSeniorityAdjustment(
  requiredLevel: ExperienceLevel,
  detectedIndicators: SeniorityIndicators
): number {
  const levelValues = {
    [ExperienceLevel.ENTRY]: 1,
    [ExperienceLevel.JUNIOR]: 2,
    [ExperienceLevel.MID]: 3,
    [ExperienceLevel.SENIOR]: 4,
    [ExperienceLevel.LEAD]: 5,
    [ExperienceLevel.PRINCIPAL]: 6,
    [ExperienceLevel.EXECUTIVE]: 7
  };

  const requiredValue = levelValues[requiredLevel];
  const detectedValue = levelValues[detectedIndicators.level];
  
  // Perfect match
  if (requiredValue === detectedValue) return 1.0;
  
  // Over-qualified (detected > required) - slight bonus
  if (detectedValue > requiredValue) {
    const difference = detectedValue - requiredValue;
    return Math.min(1.0 + (difference * 0.05), 1.15); // Max 15% bonus
  }
  
  // Under-qualified (detected < required) - penalty
  const difference = requiredValue - detectedValue;
  return Math.max(1.0 - (difference * 0.15), 0.4); // Max 60% penalty
}

/**
 * Extract keywords from text with improved processing
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Preserve compound terms before splitting
  let processedText = text.toLowerCase();
  
  // Preserve common compound terms
  const compoundTerms = [
    'machine learning',
    'artificial intelligence',
    'data science',
    'product management',
    'project management',
    'business analysis',
    'software engineering',
    'full stack',
    'front end',
    'back end',
    'user experience',
    'user interface'
  ];
  
  const preservedCompounds: string[] = [];
  compoundTerms.forEach(term => {
    if (processedText.includes(term)) {
      preservedCompounds.push(term.replace(/\s+/g, '_'));
      processedText = processedText.replace(new RegExp(term, 'g'), term.replace(/\s+/g, '_'));
    }
  });
  
  // Extract individual keywords
  const keywords = processedText
    .replace(/[^\w\s_]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .map(word => word.replace(/_/g, ' ')) // Restore compound terms
    .slice(0, 30); // Increased limit for better coverage
  
  return keywords;
}

/**
 * Detect hybrid/compound roles
 */
export function detectHybridRoles(parsedCV: ParsedCV): string[] {
  const hybridPatterns = [
    /technical\s+product\s+manager/i,
    /full[\s-]?stack\s+developer/i,
    /dev[\s-]?ops\s+engineer/i,
    /ui[\s\/]ux\s+designer/i,
    /data\s+science\s+engineer/i,
    /business\s+systems\s+analyst/i,
    /solutions\s+architect/i,
    /engineering\s+manager/i
  ];

  const cvText = getCVFullText(parsedCV);
  const detectedHybridRoles: string[] = [];

  for (const pattern of hybridPatterns) {
    if (pattern.test(cvText)) {
      const match = cvText.match(pattern);
      if (match) {
        detectedHybridRoles.push(match[0]);
      }
    }
  }

  return detectedHybridRoles;
}