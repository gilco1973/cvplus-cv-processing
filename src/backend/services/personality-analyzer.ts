// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Personality Analysis Module
 *
 * Analyzes CV data to extract personality profiles and communication styles.
 * Extracted from enhanced-prompt-engine.service.ts for better modularity.
 *
 * @author Gil Klainert
 * @version 1.0.0
 */

import { ParsedCV } from '../../types/enhanced-models';
import { PersonalityProfile } from '../../types/enhanced-models';

export class PersonalityAnalyzer {
  /**
   * Analyzes CV data to extract personality profile
   */
  async analyzePersonality(cv: ParsedCV): Promise<PersonalityProfile> {
    const communicationStyle = this.determineCommunicationStyle(cv);
    const leadershipType = this.determineLeadershipType(cv);
    const technicalDepth = this.determineTechnicalDepth(cv);
    const careerStage = this.determineCareerStage(cv);
    const personalityTraits = this.extractPersonalityTraits(cv);

    return {
      communicationStyle,
      leadershipType,
      technicalDepth,
      industryFocus: (cv.personalInfo as any)?.industry || 'general',
      careerStage,
      personalityTraits
    };
  }

  private determineCommunicationStyle(cv: ParsedCV): PersonalityProfile['communicationStyle'] {
    const summary = cv.summary || '';
    const achievements = cv.experience?.map((exp: any) => exp.achievements).flat() || [];
    const allText = summary + ' ' + achievements.join(' ');

    // Analyze language patterns
    const directIndicators = ['led', 'managed', 'delivered', 'achieved', 'implemented'];
    const collaborativeIndicators = ['collaborated', 'partnered', 'facilitated', 'coordinated'];
    const analyticalIndicators = ['analyzed', 'researched', 'evaluated', 'optimized'];
    const creativeIndicators = ['designed', 'created', 'innovated', 'developed'];

    const scores = {
      direct: this.countIndicators(allText, directIndicators),
      collaborative: this.countIndicators(allText, collaborativeIndicators),
      analytical: this.countIndicators(allText, analyticalIndicators),
      creative: this.countIndicators(allText, creativeIndicators)
    };

    return this.getHighestScore(scores) as PersonalityProfile['communicationStyle'];
  }

  private determineLeadershipType(cv: ParsedCV): PersonalityProfile['leadershipType'] {
    const titles = cv.experience?.map((exp: any) => exp.position?.toLowerCase() || '') || [];
    const responsibilities = cv.experience?.map((exp: any) => exp.description || []).flat() || [];
    const allText = titles.join(' ') + ' ' + responsibilities.join(' ');

    const visionaryIndicators = ['strategy', 'vision', 'innovation', 'transformation'];
    const operationalIndicators = ['operations', 'process', 'efficiency', 'execution'];
    const servantIndicators = ['mentored', 'supported', 'enabled', 'empowered'];
    const strategicIndicators = ['strategic', 'planning', 'roadmap', 'direction'];

    const scores = {
      visionary: this.countIndicators(allText, visionaryIndicators),
      operational: this.countIndicators(allText, operationalIndicators),
      servant: this.countIndicators(allText, servantIndicators),
      strategic: this.countIndicators(allText, strategicIndicators)
    };

    return this.getHighestScore(scores) as PersonalityProfile['leadershipType'];
  }

  private determineTechnicalDepth(cv: ParsedCV): PersonalityProfile['technicalDepth'] {
    const skills = Array.isArray(cv.skills) ? cv.skills : [];
    const experience = cv.experience || [];

    // Count technical skills depth
    const skillCount = skills.length;
    const hasArchitectureExperience = experience.some((exp: any) =>
      exp.position?.toLowerCase().includes('architect') ||
      (exp.description && exp.description.toLowerCase().includes('architecture'))
    );
    const hasManagementExperience = experience.some((exp: any) =>
      exp.position?.toLowerCase().includes('manager') ||
      exp.position?.toLowerCase().includes('director')
    );

    if (hasArchitectureExperience) return 'architect';
    if (hasManagementExperience) return 'manager';
    if (skillCount > 15) return 'specialist';
    return 'generalist';
  }

  private determineCareerStage(cv: ParsedCV): PersonalityProfile['careerStage'] {
    const totalYears = this.calculateTotalExperience(cv);
    const hasExecutiveTitle = cv.experience?.some((exp: any) =>
      ['ceo', 'cto', 'vp', 'president', 'director'].some(title =>
        exp.position?.toLowerCase().includes(title)
      )
    ) || false;

    if (hasExecutiveTitle || totalYears > 15) return 'executive';
    if (totalYears > 10) return 'senior';
    if (totalYears > 5) return 'mid';
    return 'early';
  }

  private extractPersonalityTraits(cv: ParsedCV): string[] {
    const traits: string[] = [];
    const summary = cv.summary || '';
    const achievements = cv.experience?.map((exp: any) => exp.achievements || []).flat() || [];
    const allText = summary + ' ' + achievements.join(' ');

    // Define trait patterns
    const traitPatterns = {
      'results-driven': ['results', 'achievement', 'delivered', 'exceeded'],
      'innovative': ['innovation', 'creative', 'designed', 'pioneered'],
      'analytical': ['analyzed', 'data', 'metrics', 'research'],
      'collaborative': ['team', 'collaboration', 'partnership', 'cross-functional'],
      'detail-oriented': ['detail', 'thorough', 'precise', 'accuracy'],
      'leadership-focused': ['led', 'managed', 'directed', 'guided']
    };

    for (const [trait, indicators] of Object.entries(traitPatterns)) {
      if (this.countIndicators(allText, indicators) > 0) {
        traits.push(trait);
      }
    }

    return traits.slice(0, 5); // Limit to top 5 traits
  }

  private calculateTotalExperience(cv: ParsedCV): number {
    if (!cv.experience) return 0;

    let totalYears = 0;
    for (const exp of cv.experience) {
      if (exp.duration) {
        totalYears += this.parseDurationToYears(exp.duration);
      }
    }
    return totalYears;
  }

  private parseDurationToYears(duration: string): number {
    const lowerDuration = duration.toLowerCase();

    // Extract numbers from duration string
    const numbers = lowerDuration.match(/\d+/g);
    if (!numbers) return 0;

    let years = 0;

    // Handle different formats
    if (lowerDuration.includes('year')) {
      years = parseInt(numbers[0]);
    } else if (lowerDuration.includes('month')) {
      years = parseInt(numbers[0]) / 12;
    } else {
      // Assume format like "2020-2023" or "Jan 2020 - Dec 2022"
      if (numbers.length >= 2) {
        const startYear = parseInt(numbers[0]);
        const endYear = parseInt(numbers[numbers.length - 1] || '0');
        years = endYear - startYear;
      }
    }

    return Math.max(years, 0);
  }

  private countIndicators(text: string, indicators: string[]): number {
    const lowerText = text.toLowerCase();
    return indicators.reduce((count, indicator) => {
      const matches = lowerText.match(new RegExp(indicator, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  private getHighestScore(scores: Record<string, number>): string {
    const keys = Object.keys(scores);
    if (keys.length === 0) return '';
    
    let highest = keys[0];
    for (const [key, value] of Object.entries(scores)) {
      if (highest && value > (scores[highest] || 0)) {
        highest = key;
      }
    }
    return highest || '';
  }
}