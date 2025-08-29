/**
 * ML Pipeline Types
 * Extracted from phase2-models.ts for better modularity
 * 
 * ML model metadata, feature vectors, training configuration, and API responses.
 */

// ===============================
// ML PIPELINE MODELS
// ===============================

export interface MLModelMetadata {
  modelId: string;
  modelName: string;
  modelType: 'classification' | 'regression' | 'clustering' | 'recommendation' | 'nlp' | 'computer_vision' | 'ensemble';
  modelVersion: string;
  
  // Training information
  trainingData: {
    datasetSize: number;
    datasetVersion: string;
    trainingDate: Date;
    validationSplit: number;
    testSplit: number;
  };
  
  // Model architecture
  architecture: {
    algorithm: string;
    hyperparameters: Record<string, any>;
    inputShape?: number[];
    outputShape?: number[];
    layers?: Array<{
      type: string;
      config: Record<string, any>;
    }>;
  };
  
  // Performance metrics
  performance: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    auc?: number;
    mse?: number;
    mae?: number;
    r2?: number;
    
    // Cross-validation results
    cvScores?: number[];
    cvMean?: number;
    cvStd?: number;
    crossValidation?: any;
  };
  
  // Feature importance
  featureImportance: Array<{
    feature: string;
    importance: number;
    rank: number;
  }>;
  
  // Deployment information
  deployment: {
    environment: 'development' | 'staging' | 'production';
    deploymentDate: Date;
    servingFramework: string;
    scalingConfig: {
      minInstances: number;
      maxInstances: number;
      targetConcurrency: number;
    };
    endpoint?: string;
  };
  
  // Model monitoring
  monitoring: {
    driftDetection: boolean;
    performanceThresholds: {
      accuracyMin: number;
      latencyMax: number;
      throughputMin: number;
    };
    alertingConfig: Record<string, any>;
    predictionCount?: number;
  };
  
  // Lineage and dependencies
  lineage: {
    parentModels?: string[];
    dataSourceIds: string[];
    preprocessingSteps: string[];
    featureEngineering: string[];
  };
  
  // Additional properties used by services
  version?: string;
  training?: {
    completionDate?: Date;
    duration?: number;
    samples?: number;
  };
}

export interface FeatureVector {
  vectorId: string;
  userId: string;
  jobId?: string;
  timestamp: Date;
  
  // Raw features
  rawFeatures?: {
    // Personal information
    age?: number;
    location?: string;
    educationLevel?: number;
    yearsExperience?: number;
    
    // CV content features
    skillsCount?: number;
    uniqueSkills?: string[];
    experienceGaps?: number[];
    jobTenure?: number[];
    industryExperience?: Record<string, number>;
    
    // Textual features
    cvWordCount?: number;
    readabilityScore?: number;
    keywordDensity?: Record<string, number>;
    sentimentScore?: number;
    
    // Structural features
    sectionsCount?: number;
    formattingScore?: number;
    lengthScore?: number;
    visualElementsCount?: number;
  };
  
  // Engineered features
  engineeredFeatures?: {
    // Composite scores
    overallQualityScore?: number;
    experienceRelevanceScore?: number;
    skillMatchScore?: number;
    careerProgressionScore?: number;
    
    // Derived metrics
    averageJobTenure?: number;
    careerGrowthRate?: number;
    skillDiversityIndex?: number;
    leadershipIndicator?: number;
    
    // Market alignment
    marketDemandScore?: number;
    salaryCompatibilityScore?: number;
    locationFlexibilityScore?: number;
  };
  
  // Embeddings
  embeddings?: {
    cvEmbedding?: number[];
    skillsEmbedding?: number[];
    experienceEmbedding?: number[];
    industryEmbedding?: number[];
  };
  
  // Context features
  contextFeatures?: {
    targetRole?: string;
    targetIndustry?: string;
    targetLocation?: string;
    targetSalary?: number;
    
    // Market context
    marketConditions?: {
      competitionLevel: number;
      demandLevel: number;
      seasonalFactor: number;
    };
  };
  
  // Feature metadata
  metadata?: {
    extractionVersion: string;
    extractionTimestamp: Date;
    confidenceScores?: Record<string, number>;
    missingFeatures?: string[];
    featureSource?: Record<string, string>;
  };
  
  // Additional feature categories used by services
  cvFeatures?: {
    keywordMatch?: number;
    skillsAlignment?: number;
    experienceRelevance?: number;
    educationMatch?: number;
    educationLevel?: number;
    // Additional CV features for predictions
    experienceYears?: number;
    skillsCount?: number;
    wordCount?: number;
    sectionsCount?: number;
    certificationsCount?: number;
    projectsCount?: number;
    achievementsCount?: number;
    keywordDensity?: number;
    readabilityScore?: number;
    formattingScore?: number;
  };
  
  matchingFeatures?: {
    roleMatch?: number;
    industryMatch?: number;
    skillsMatch?: number;
    experienceMatch?: number;
    skillMatchPercentage?: number;
    experienceRelevance?: number;
    // Additional matching features
    educationMatch?: number;
    titleSimilarity?: number;
    companyFit?: number;
    salaryAlignment?: number;
    industryExperience?: number;
    locationMatch?: number;
  };
  
  behaviorFeatures?: {
    applicationTiming?: number;
    weekdayApplication?: boolean;
    timeOfDay?: number;
    applicationMethod?: number;
    cvOptimizationLevel?: number;
    platformEngagement?: number;
    previousApplications?: number;
  };
  
  derivedFeatures?: {
    careerTrajectory?: number;
    skillGrowth?: number;
    marketAlignment?: number;
    competitiveness?: number;
    careerProgressionScore?: number;
    // Additional derived features for predictions
    leadershipPotential?: number;
    innovationIndicator?: number;
    adaptabilityScore?: number;
    stabilityScore?: number;
    underqualificationScore?: number;
    overqualificationScore?: number;
  };
  
  marketFeatures?: {
    demandLevel?: number;
    competitionLevel?: number;
    salaryBenchmark?: number;
    growthPotential?: number;
    demandSupplyRatio?: number;
    // Additional market features
    industryGrowth?: number;
    economicIndicators?: number;
    locationCompetitiveness?: number;
    salaryCompetitiveness?: number;
    seasonality?: number;
  };
  
  // Backward compatibility
  extractionDate?: Date;
}

// ===============================
// API RESPONSE MODELS
// ===============================

export interface Phase2APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
    version: string;
  };
}

export interface PredictionResponse extends Phase2APIResponse<import('./success-prediction').SuccessPrediction> {
  // Additional prediction-specific metadata
}

export interface AnalyticsResponse extends Phase2APIResponse<import('./analytics').AnalyticsMetrics> {
  // Additional analytics-specific metadata
}

export interface IndustryOptimizationResponse extends Phase2APIResponse<{
  optimizations: Array<{
    type: string;
    suggestion: string;
    impact: number;
  }>;
}> {}

export interface RegionalOptimizationResponse extends Phase2APIResponse<{
  localizations: Array<{
    aspect: string;
    recommendation: string;
    importance: number;
  }>;
}> {}

// ===============================
// TRAINING AND CONFIG MODELS
// ===============================

export interface MLTrainingConfig {
  configId: string;
  modelType: string;
  
  // Data configuration
  dataConfig: {
    trainingDataPath: string;
    validationDataPath?: string;
    testDataPath?: string;
    featureColumns: string[];
    targetColumn: string;
    categoricalFeatures?: string[];
    numericalFeatures?: string[];
  };
  
  // Training parameters
  trainingParams: {
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
    optimizerType?: string;
    lossFunction?: string;
    regularization?: {
      l1?: number;
      l2?: number;
      dropout?: number;
    };
  };
  
  // Hyperparameter tuning
  hyperparameterTuning?: {
    method: 'grid_search' | 'random_search' | 'bayesian' | 'genetic';
    parameterSpace: Record<string, any>;
    maxTrials: number;
    objective: string;
  };
}