// FIXED VERSION - Core Role Detection Service
/**
 * Core Role Detection Service
 * 
 * Main service that orchestrates role detection with enhanced accuracy
 */

import { ParsedCV } from '../types/job';
import {
  RoleProfile,
  RoleMatchResult,
  RoleDetectionConfig,
  RoleProfileAnalysis,
  ExperienceLevel
} from '../types/role-profile.types';
import { VerifiedClaudeService } from './verified-claude.service';
import { RoleProfileService } from './role-profile.service';
import { FuzzyMatchingService } from './role-detection-fuzzy.service';
import { RoleDetectionAnalyzer } from './role-detection-analyzer';
import { RoleDetectionMatcher } from './role-detection-matcher';
import { FuzzyMatchConfig } from './role-detection-helpers';
import {
  createSynonymMap,
  createAbbreviationMap,
  createNegativeIndicators,
  createSeniorityKeywords
} from './role-detection-maps';

export class RoleDetectionCoreService {
  private claudeService: VerifiedClaudeService;
  private roleProfileService: RoleProfileService;
  private fuzzyMatcher: FuzzyMatchingService;
  private analyzer: RoleDetectionAnalyzer;
  private matcher: RoleDetectionMatcher;
  private config: RoleDetectionConfig;
  private fuzzyConfig: FuzzyMatchConfig;

  constructor(config?: Partial<RoleDetectionConfig>) {
    this.claudeService = new VerifiedClaudeService();
    this.roleProfileService = new RoleProfileService();
    
    // Enhanced configuration with updated weights
    this.config = {
      confidenceThreshold: 0.6,
      maxResults: 5,
      minResults: 1,
      enableMultiRoleDetection: true,
      enableDynamicThreshold: true,
      weightingFactors: {
        title: 0.40,     // Increased from 0.30
        skills: 0.30,    // Decreased from 0.35
        experience: 0.20, // Decreased from 0.25
        industry: 0.07,   // Decreased from 0.08
        education: 0.03   // Increased from 0.02
      },
      dynamicThresholdConfig: {
        initialThreshold: 0.6,
        minimumThreshold: 0.4,
        decrementStep: 0.1,
        maxIterations: 3
      },
      ...config
    };

    // Enhanced fuzzy matching configuration
    this.fuzzyConfig = {
      threshold: 0.7,
      enableAbbreviations: true,
      enableSynonyms: true
    };

    // Initialize services with enhanced fuzzy configuration
    const synonymMap = createSynonymMap();
    const abbreviationMap = createAbbreviationMap();
    const negativeIndicators = createNegativeIndicators();
    const seniorityKeywords = createSeniorityKeywords();
    
    this.fuzzyMatcher = new FuzzyMatchingService(this.fuzzyConfig, synonymMap, abbreviationMap);
    
    // Create analyzer and matcher with required dependencies
    this.analyzer = new RoleDetectionAnalyzer(this.config, this.roleProfileService);
    this.matcher = new RoleDetectionMatcher(
      this.config,
      this.fuzzyConfig,
      this.fuzzyMatcher,
      negativeIndicators,
      seniorityKeywords
    );
  }

  /**
   * Detect roles from CV with enhanced accuracy
   */
  async detectRoles(cv: ParsedCV, targetRoles?: string[]): Promise<RoleMatchResult[]> {
    try {
      // Enhanced role detection with improved accuracy
      const results = await this.performEnhancedRoleDetection(cv, targetRoles);
      return results;
    } catch (error) {
      console.error('Role detection failed:', error);
      throw new Error(`Failed to detect roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform enhanced role detection with multiple strategies
   */
  private async performEnhancedRoleDetection(
    cv: ParsedCV, 
    targetRoles?: string[]
  ): Promise<RoleMatchResult[]> {
    // Get available role profiles
    const availableProfiles = await this.roleProfileService.getAllProfiles();
    const profilesToCheck = targetRoles 
      ? availableProfiles.filter(p => targetRoles.includes(p.id))
      : availableProfiles;

    const results: RoleMatchResult[] = [];

    for (const profile of profilesToCheck) {
      try {
        // Perform enhanced matching using analyzer and matcher
        const matchResult = await this.performRoleMatch(cv, profile);
        
        if (matchResult.confidence >= this.config.confidenceThreshold) {
          results.push(matchResult);
        }
      } catch (error) {
        console.warn(`Failed to match role ${profile.id}:`, error);
        // Continue with other roles even if one fails
      }
    }

    // Sort by confidence and return top results
    return results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxResults);
  }

  /**
   * Perform role matching with enhanced accuracy
   */
  private async performRoleMatch(cv: ParsedCV, profile: RoleProfile): Promise<RoleMatchResult> {
    // Use the analyzer to get detailed analysis
    const analysis = await this.analyzer.analyzeRoleCompatibility(cv, profile);
    
    // Return the primary role match result from the analysis
    return analysis.primaryRole;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      service: 'RoleDetectionCoreService',
      config: this.config,
      fuzzyConfig: this.fuzzyConfig,
      features: {
        fuzzyMatching: true,
        synonymDetection: true,
        seniorityDetection: true,
        hybridRoleDetection: true,
        negativeIndicators: true,
        recencyWeighting: true
      }
    };
  }
}