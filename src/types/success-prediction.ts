// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Success Prediction Types
 * Extracted from phase2-models.ts for better modularity
 * 
 * Core predictions, salary predictions, time to hire predictions,
 * and predictive recommendations.
 */

// ===============================
// SUCCESS PREDICTION MODELS
// ===============================

export interface SuccessPrediction {
  predictionId: string;
  userId: string;
  jobId: string;
  timestamp: Date;
  
  // Core predictions
  interviewProbability: number; // 0-1
  offerProbability: number; // 0-1
  hireProbability: number; // 0-1
  
  // Advanced predictions
  salaryPrediction: SalaryPrediction;
  timeToHire: TimeToHirePrediction;
  competitivenessScore: number; // 0-100
  
  // Confidence metrics
  confidence: {
    overall: number; // 0-1
    interviewConfidence: number;
    offerConfidence: number;
    salaryConfidence: number;
  };
  
  // Recommendations
  recommendations: PredictiveRecommendation[];
  
  // Model metadata
  modelMetadata: {
    modelVersion: string;
    featuresUsed: string[];
    trainingDataSize: number;
    lastTrainingDate: Date;
  };
}

export interface SalaryPrediction {
  predictedSalaryRange: {
    min: number;
    max: number;
    median: number;
    currency: string;
  };
  // Alias for backward compatibility
  predictedRange: {
    min: number;
    max: number;
    median: number;
    currency: string;
  };
  confidenceInterval: {
    lower: number; // 5th percentile
    upper: number; // 95th percentile
  };
  regionalAdjustment: {
    baseLocation: string;
    adjustmentFactor: number;
    costOfLivingIndex: number;
  };
  industryBenchmark: {
    industryMedian: number;
    percentileRank: number; // User's position in industry
  };
  factors: Array<{
    factor: string;
    impact: number; // -1 to 1
    description: string;
  }>;
  // Additional properties used by services
  negotiationPotential?: number;
}

export interface TimeToHirePrediction {
  estimatedDays: {
    min: number;
    max: number;
    median: number;
  };
  phaseBreakdown: {
    application: number;
    screening: number;
    interviews: number;
    decision: number;
    negotiation: number;
  };
  seasonalFactors: {
    currentSeason: string;
    seasonalAdjustment: number;
    holidayImpact?: boolean;
  };
  companyFactors?: {
    companySize: string;
    hiringVelocity: string;
    processComplexity: string;
  };
  candidateFactors?: {
    experienceLevel: string;
    interviewPreparation: string;
    availability: string;
  };
  factors?: {
    companySize?: string;
    industrySpeed?: string;
    roleComplexity?: string;
    marketConditions?: string;
  };
  confidence: number;
  industryBenchmark?: number;
}

export interface PredictiveRecommendation {
  recommendationId: string;
  type: 'skill' | 'experience' | 'education' | 'certification' | 'project';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems?: string[];
  timeToImplement?: number;
  
  // Impact prediction
  expectedImpact: {
    interviewProbabilityIncrease: number; // 0-1
    offerProbabilityIncrease: number; // 0-1
    salaryIncrease: number; // percentage
  };
  
  // Implementation details
  implementation: {
    estimatedTimeToComplete: number; // days
    difficulty: 'easy' | 'medium' | 'hard';
    cost: number;
    resources: string[];
  };
  
  // Evidence
  evidence: {
    dataPoints: number;
    successRate: number;
    similarProfiles: number;
    similarCases?: string;
  };
  
  // Tracking
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  dateGenerated: Date;
  dateUpdated?: Date;
}

// Type unions for easier handling
export type PredictionTypes = SuccessPrediction | SalaryPrediction | TimeToHirePrediction;