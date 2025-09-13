/**
 * Enhanced ATS Types for Backend
 * 
 * Advanced ATS optimization and analysis types.
 */

export interface ATSOptimizationResult {
  score: number;
  grade: string;
  recommendations: string[];
  insights: any;
  optimizations: any[];
  overall?: {
    score: number;
    grade: string;
    issues: string[];
  };
}

export interface ATSAnalysisConfig {
  strictMode: boolean;
  targetSystems: string[];
  industryRules: any[];
}

export interface ATSKeywordAnalysis {
  matches: string[];
  missing: string[];
  density: number;
  distribution: any;
}

export interface ATSFormatAnalysis {
  structure: any;
  compliance: number;
  issues: string[];
}

export interface CompetitorAnalysis {
  benchmarks: any[];
  positioning: any;
  improvements: string[];
}

export interface PrioritizedRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  impact: number;
  effort: number;
}