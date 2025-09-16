// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Role Detection Recommendations Service
 * 
 * Generates role-specific recommendations and gap analysis
 */

import { ParsedCV } from '../types/job';
import {
  RoleProfile,
  RoleMatchResult,
  RoleProfileAnalysis,
  MatchingFactor,
  RoleBasedRecommendation,
  CVSection
} from '@cvplus/core/types/role-profile.types';
import { RoleProfileService } from '@cvplus/core/services/role-profile.service';

export class RoleRecommendationsService {
  private roleProfileService: RoleProfileService;

  constructor(roleProfileService: RoleProfileService) {
    this.roleProfileService = roleProfileService;
  }

  /**
   * Generate role-specific enhancement recommendations
   */
  async generateRoleRecommendations(
    profile: RoleProfile,
    parsedCV: ParsedCV,
    matchingFactors: MatchingFactor[]
  ): Promise<RoleBasedRecommendation[]> {
    const recommendations: RoleBasedRecommendation[] = [];

    // Analyze gaps and generate recommendations
    const weakFactors = matchingFactors.filter(f => f.score < 0.5);
    
    for (const factor of weakFactors) {
      const recommendation = this.createRecommendationFromFactor(profile, factor, parsedCV);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Add profile-specific template recommendations
    if (profile.enhancementTemplates.professionalSummary && !parsedCV.summary) {
      recommendations.push({
        id: `${profile.id}_summary`,
        type: 'content',
        priority: 'high',
        title: `Add ${profile.name} Professional Summary`,
        description: `Create a compelling professional summary tailored for ${profile.name} roles`,
        template: profile.enhancementTemplates.professionalSummary,
        targetSection: CVSection.PROFESSIONAL_SUMMARY,
        expectedImpact: 25
      });
    }

    return recommendations.slice(0, 8); // Limit to top 8 recommendations
  }

  /**
   * Create recommendation from matching factor analysis
   */
  private createRecommendationFromFactor(
    profile: RoleProfile,
    factor: MatchingFactor,
    parsedCV: ParsedCV
  ): RoleBasedRecommendation | null {
    const baseId = `${profile.id}_${factor.type}`;
    
    switch (factor.type) {
      case 'skills':
        return {
          id: `${baseId}_enhancement`,
          type: 'keyword',
          priority: 'high',
          title: `Enhance ${profile.name} Skills`,
          description: `Add key skills relevant to ${profile.name} roles`,
          template: `Consider adding: ${profile.requiredSkills.slice(0, 5).join(', ')}`,
          targetSection: CVSection.SKILLS,
          expectedImpact: 20
        };
        
      case 'experience':
        return {
          id: `${baseId}_optimization`,
          type: 'content',
          priority: 'medium',
          title: `Optimize Experience for ${profile.name}`,
          description: `Highlight experience relevant to ${profile.name} responsibilities`,
          template: profile.enhancementTemplates.experienceEnhancements[0]?.bulletPointTemplate || '',
          targetSection: CVSection.EXPERIENCE,
          expectedImpact: 18
        };
        
      case 'title':
        return {
          id: `${baseId}_title`,
          type: 'content',
          priority: 'high',
          title: `Update Professional Title`,
          description: `Align professional title with ${profile.name} role expectations`,
          template: `Consider titles like: ${profile.matchingCriteria.titleKeywords.slice(0, 3).join(', ')}`,
          targetSection: CVSection.PERSONAL_INFO,
          expectedImpact: 15
        };
        
      default:
        return null;
    }
  }

  /**
   * Calculate the potential for CV enhancement based on role match
   */
  calculateEnhancementPotential(
    profile: RoleProfile,
    parsedCV: ParsedCV,
    matchingFactors: MatchingFactor[]
  ): number {
    let potential = 0;
    
    // Base potential from weak matching factors
    const weakFactors = matchingFactors.filter(f => f.score < 0.7);
    potential += weakFactors.length * 15;
    
    // Additional potential from missing sections
    const missingSections = profile.validationRules.requiredSections.filter(section => {
      switch (section) {
        case CVSection.PROFESSIONAL_SUMMARY:
          return !parsedCV.summary;
        case CVSection.ACHIEVEMENTS:
          return !parsedCV.achievements || parsedCV.achievements.length === 0;
        case CVSection.CERTIFICATIONS:
          return !parsedCV.certifications || parsedCV.certifications.length === 0;
        case CVSection.PROJECTS:
          return !parsedCV.projects || parsedCV.projects.length === 0;
        default:
          return false;
      }
    });
    
    potential += missingSections.length * 10;
    
    return Math.min(potential, 100); // Cap at 100%
  }

  /**
   * Perform gap analysis between CV and role requirements
   */
  async performGapAnalysis(
    primaryRole: RoleMatchResult,
    parsedCV: ParsedCV
  ): Promise<RoleProfileAnalysis['gapAnalysis']> {
    const profile = await this.roleProfileService.getProfileById(primaryRole.roleId);
    if (!profile) {
      return { missingSkills: [], weakAreas: [], strengthAreas: [] };
    }
    
    const cvSkills = this.extractSkillsFromCV(parsedCV);
    
    // Find missing required skills
    const missingSkills = profile.requiredSkills.filter(
      skill => !cvSkills.some(cvSkill => 
        cvSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    // Identify weak areas from matching factors
    const weakAreas = primaryRole.matchingFactors
      .filter(factor => factor.score < 0.5)
      .map(factor => factor.type);
    
    // Identify strength areas
    const strengthAreas = primaryRole.matchingFactors
      .filter(factor => factor.score > 0.8)
      .map(factor => factor.type);
    
    return {
      missingSkills: missingSkills.slice(0, 10),
      weakAreas,
      strengthAreas
    };
  }

  /**
   * Extract skills from CV for gap analysis
   */
  private extractSkillsFromCV(parsedCV: ParsedCV): string[] {
    const skills: string[] = [];
    
    if (parsedCV.skills) {
      if (Array.isArray(parsedCV.skills)) {
        skills.push(...parsedCV.skills);
      } else {
        skills.push(...Object.values(parsedCV.skills).flat());
      }
    }
    
    return skills.filter(Boolean).map(s => s.toLowerCase());
  }
}