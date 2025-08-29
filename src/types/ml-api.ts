/**
 * ML API Response Types
 * 
 * API response interfaces for ML pipeline endpoints.
 * Extracted from ml-pipeline.ts to maintain <200 line compliance.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

/**
 * Base API response structure
 */
export interface Phase2APIResponse<T = any> {
  success: boolean;
  data: T;
  timestamp: Date;
  processingTime: number;
  version: string;
  warnings?: string[];
  metadata?: {
    modelVersion?: string;
    confidence?: number;
    [key: string]: any;
  };
}

/**
 * Prediction API response
 */
export interface PredictionResponse extends Phase2APIResponse<import('./success-prediction').SuccessPrediction> {
  model: string;
}

/**
 * Analytics API response
 */
export interface AnalyticsResponse extends Phase2APIResponse<import('./analytics').AnalyticsMetrics> {
  reportId: string;
}

/**
 * Industry optimization response
 */
export interface IndustryOptimizationResponse extends Phase2APIResponse<{
  recommendations: string[];
  industryScore: number;
  competitorAnalysis: any;
}> {
  industry: string;
  region: string;
}

/**
 * Regional optimization response
 */
export interface RegionalOptimizationResponse extends Phase2APIResponse<{
  salaryBenchmarks: {
    min: number;
    max: number;
    median: number;
    percentile75: number;
    percentile90: number;
  };
  marketDemand: number;
  competitionLevel: number;
  recommendations: string[];
}> {
  region: string;
  industry: string;
}