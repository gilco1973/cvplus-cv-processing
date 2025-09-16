// @ts-ignore
/**
 * Analysis Type Definitions
 * Autonomous types for CV analysis functionality
  */

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  estimatedImprovement: number; // ATS score points
  selected: boolean;
}

export interface ATSAnalysisIssue {
  message: string;
  severity: 'error' | 'warning';
  category: string;
}

export interface ATSAnalysisSuggestion {
  reason: string;
  impact: string;
  category: string;
}

export interface ATSAnalysis {
  currentScore: number;
  predictedScore: number;
  issues: ATSAnalysisIssue[];
  suggestions: ATSAnalysisSuggestion[];
  overall: number;
  passes: boolean;
}

export interface PrioritizedRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedImprovement: number;
  reasoning: string;
}

export interface AnalysisResult {
  jobId: string;
  recommendations: RecommendationItem[];
  atsAnalysis: ATSAnalysis;
  summary: {
    totalRecommendations: number;
    highPriorityCount: number;
    potentialScoreIncrease: number;
  };
  createdAt: string;
  updatedAt: string;
}