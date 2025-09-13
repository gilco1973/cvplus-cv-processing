/**
 * Enhanced ATS types placeholder
 * Created to resolve missing module imports
 */

export interface ATSAnalysis {
  score: number;
  keywords: string[];
  recommendations: string[];
  compatibility: "low" | "medium" | "high";
}

export interface ATSOptimizationRequest {
  cvData: any;
  jobDescription?: string;
  targetKeywords?: string[];
}

export interface ATSOptimizationResult {
  originalScore: number;
  optimizedScore: number;
  improvements: string[];
  optimizedContent: any;
}
