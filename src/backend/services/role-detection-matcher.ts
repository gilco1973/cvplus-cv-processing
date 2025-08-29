/**
 * Role Detection Matcher
 * 
 * Handles matching logic between CV features and role profiles
 */

import { ParsedCV } from '../types/job';
import {
  RoleProfile,
  RoleMatchResult,
  RoleDetectionConfig,
  MatchingFactor,
  ExperienceLevel
} from '../types/role-profile.types';
import { FuzzyMatchingService } from './role-detection-fuzzy.service';
import {
  FuzzyMatchConfig,
  getCVFullText,
  calculateSeniorityAdjustment
} from './role-detection-helpers';
import { checkNegativeIndicators } from './role-detection-maps';

export class RoleDetectionMatcher {
  private config: RoleDetectionConfig;
  private fuzzyConfig: FuzzyMatchConfig;
  private fuzzyMatcher: FuzzyMatchingService;
  private negativeIndicators: Map<string, string[]>;
  private seniorityKeywords: Map<ExperienceLevel, string[]>;

  constructor(
    config: RoleDetectionConfig,
    fuzzyConfig: FuzzyMatchConfig,
    fuzzyMatcher: FuzzyMatchingService,
    negativeIndicators: Map<string, string[]>,
    seniorityKeywords: Map<ExperienceLevel, string[]>
  ) {
    this.config = config;
    this.fuzzyConfig = fuzzyConfig;
    this.fuzzyMatcher = fuzzyMatcher;
    this.negativeIndicators = negativeIndicators;
    this.seniorityKeywords = seniorityKeywords;
  }

  /**
   * Calculate comprehensive match score between CV and role profile
   */
  calculateMatchScore(
    cv: ParsedCV, 
    profile: RoleProfile, 
    analysis?: any
  ): number {
    const factors = this.calculateMatchingFactors(cv, profile);
    
    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;

    for (const factor of factors) {
      totalScore += factor.score * factor.weight;
      totalWeight += factor.weight;
    }

    const baseScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    // Apply seniority adjustment
    const seniorityAdjustment = this.calculateSeniorityBonus(cv, profile);
    
    // Apply negative indicator penalty
    const negativePenalty = this.calculateNegativePenalty(cv, profile);
    
    // Final score with adjustments
    const finalScore = Math.max(0, Math.min(1, baseScore + seniorityAdjustment - negativePenalty));
    
    return finalScore;
  }

  /**
   * Calculate matching factors between CV and role profile
   */
  private calculateMatchingFactors(cv: ParsedCV, profile: RoleProfile): MatchingFactor[] {
    const factors: MatchingFactor[] = [];

    // Title matching
    if (cv.personalInfo?.title && profile.name) {
      const titleMatch = this.fuzzyMatcher.fuzzyMatch(
        cv.personalInfo.title,
        profile.name,
        this.fuzzyConfig.threshold
      ) ? 0.8 : 0.2;
      
      factors.push({
        type: 'title',
        matchedKeywords: [cv.personalInfo.title],
        score: titleMatch,
        weight: this.config.weightingFactors.title,
        details: `Job title "${cv.personalInfo.title}" matches role "${profile.name}"`,
        reasoning: {
          contributionExplanation: `Title matching with ${Math.round(titleMatch * 100)}% confidence`,
          keywordMatches: [{
            keyword: cv.personalInfo.title,
            found: titleMatch > 0.5,
            matchType: 'fuzzy',
            relevance: titleMatch
          }],
          strengthAssessment: titleMatch > 0.7 ? 'excellent' : titleMatch > 0.5 ? 'good' : titleMatch > 0.3 ? 'moderate' : 'weak',
          improvementSuggestions: titleMatch < 0.5 ? ['Consider aligning job title with target role'] : [],
          confidenceFactors: [`Title relevance: ${Math.round(titleMatch * 100)}%`]
        }
      });
    }

    // Skills matching
    if (cv.skills && profile.requiredSkills) {
      // Handle both array and object format for skills
      const cvSkillsArray = Array.isArray(cv.skills) 
        ? cv.skills 
        : Object.values(cv.skills).flat().filter(Boolean) as string[];
      
      const skillsMatch = this.calculateSkillsMatch(cvSkillsArray, profile.requiredSkills);
      
      factors.push({
        type: 'skills',
        matchedKeywords: cvSkillsArray.slice(0, 5), // Top 5 skills
        score: skillsMatch,
        weight: this.config.weightingFactors.skills,
        details: `Skills alignment: ${Math.round(skillsMatch * 100)}% match with required skills`,
        reasoning: {
          contributionExplanation: `Skills matching analysis`,
          keywordMatches: cvSkillsArray.slice(0, 3).map(skill => ({
            keyword: skill,
            found: true,
            matchType: 'fuzzy' as const,
            relevance: skillsMatch
          })),
          strengthAssessment: skillsMatch > 0.7 ? 'excellent' : skillsMatch > 0.4 ? 'good' : skillsMatch > 0.2 ? 'moderate' : 'weak',
          improvementSuggestions: skillsMatch < 0.6 ? ['Add more relevant technical skills'] : [],
          confidenceFactors: [`Skills match: ${Math.round(skillsMatch * 100)}%`]
        }
      });
    }

    // Experience matching
    if (cv.experience && cv.experience.length > 0) {
      const experienceMatch = this.calculateExperienceMatch(cv, profile);
      const experienceKeywords = cv.experience.map(exp => exp.position).filter(Boolean);
      
      factors.push({
        type: 'experience',
        matchedKeywords: experienceKeywords.slice(0, 3),
        score: experienceMatch,
        weight: this.config.weightingFactors.experience,
        details: `Work experience relevance: ${Math.round(experienceMatch * 100)}%`,
        reasoning: {
          contributionExplanation: `Experience relevance analysis`,
          keywordMatches: experienceKeywords.slice(0, 2).map(pos => ({
            keyword: pos,
            found: true,
            matchType: 'fuzzy' as const,
            relevance: experienceMatch
          })),
          strengthAssessment: experienceMatch > 0.7 ? 'excellent' : experienceMatch > 0.4 ? 'good' : experienceMatch > 0.2 ? 'moderate' : 'weak',
          improvementSuggestions: experienceMatch < 0.6 ? ['Highlight more relevant work experience'] : [],
          confidenceFactors: [`Experience relevance: ${Math.round(experienceMatch * 100)}%`]
        }
      });
    }

    return factors;
  }

  /**
   * Calculate skills matching score
   */
  private calculateSkillsMatch(cvSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 0.5;

    let matchCount = 0;
    const totalRequired = requiredSkills.length;

    for (const required of requiredSkills) {
      for (const cvSkill of cvSkills) {
        const similarity = this.fuzzyMatcher.fuzzyMatch(cvSkill, required, this.fuzzyConfig.threshold) ? 0.8 : 0.2;
        if (similarity >= 0.6) {
          matchCount++;
          break; // Found a match, move to next required skill
        }
      }
    }

    return matchCount / totalRequired;
  }

  /**
   * Calculate experience matching score
   */
  private calculateExperienceMatch(cv: ParsedCV, profile: RoleProfile): number {
    if (!cv.experience || cv.experience.length === 0) return 0;

    let totalRelevance = 0;
    const experiences = cv.experience;

    for (const experience of experiences) {
      const titleRelevance = experience.position 
        ? (this.fuzzyMatcher.fuzzyMatch(experience.position, profile.name, this.fuzzyConfig.threshold) ? 0.8 : 0.2)
        : 0;
      
      const descriptionRelevance = experience.description
        ? this.calculateDescriptionRelevance(experience.description, profile)
        : 0;

      // Weight more recent experience higher
      const recencyWeight = this.calculateRecencyWeight(experience.startDate, experience.endDate);
      
      const experienceRelevance = Math.max(titleRelevance, descriptionRelevance) * recencyWeight;
      totalRelevance += experienceRelevance;
    }

    return Math.min(1, totalRelevance / experiences.length);
  }

  /**
   * Calculate description relevance to role profile
   */
  private calculateDescriptionRelevance(description: string, profile: RoleProfile): number {
    const descriptionLower = description.toLowerCase();
    const profileKeywords = [
      profile.name.toLowerCase(),
      ...(profile.requiredSkills?.map(s => s.toLowerCase()) || [])
    ];

    let relevanceCount = 0;
    for (const keyword of profileKeywords) {
      if (descriptionLower.includes(keyword)) {
        relevanceCount++;
      }
    }

    return profileKeywords.length > 0 ? relevanceCount / profileKeywords.length : 0;
  }

  /**
   * Calculate recency weight for experience
   */
  private calculateRecencyWeight(startDate?: string, endDate?: string): number {
    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    const yearsAgo = (now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // More recent experience gets higher weight
    return Math.max(0.3, 1 - (yearsAgo * 0.1));
  }

  /**
   * Calculate seniority bonus
   */
  private calculateSeniorityBonus(cv: ParsedCV, profile: RoleProfile): number {
    // Simple seniority calculation based on years of experience
    const totalYears = cv.experience?.reduce((total, exp) => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = new Date(exp.endDate);
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
      }
      return total;
    }, 0) || 0;

    // Bonus for senior roles with experience
    if (totalYears >= 5 && profile.experienceLevel === 'senior') {
      return 0.1;
    }
    
    return 0;
  }

  /**
   * Calculate negative indicator penalty
   */
  private calculateNegativePenalty(cv: ParsedCV, profile: RoleProfile): number {
    const cvText = getCVFullText(cv);
    const indicators = this.negativeIndicators.get(profile.id) || [];
    
    let penalty = 0;
    for (const indicator of indicators) {
      if (cvText.toLowerCase().includes(indicator.toLowerCase())) {
        penalty += 0.1; // 10% penalty per negative indicator
      }
    }
    
    return Math.min(penalty, 0.3); // Cap penalty at 30%
  }

  /**
   * Get seniority keywords for external use
   */
  getSeniorityKeywords(): Map<ExperienceLevel, string[]> {
    return this.seniorityKeywords;
  }

  /**
   * Update configuration
   */
  updateConfig(config: RoleDetectionConfig): void {
    this.config = config;
  }
}