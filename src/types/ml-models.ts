// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * ML Model Types
 * 
 * ML model metadata and configuration types.
 * Extracted from ml-pipeline.ts to maintain <200 line compliance.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

export interface MLModelMetadata {
  modelId: string;
  modelName: string;
  modelType: 'classification' | 'regression' | 'clustering' | 'recommendation' | 'nlp' | 'computer_vision' | 'ensemble';
  modelVersion: string;
  
  /** Training information */
  trainingData: {
    datasetSize: number;
    datasetVersion: string;
    trainingDate: Date;
    validationSplit: number;
    testSplit: number;
  };
  
  /** Model architecture */
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
  
  /** Performance metrics */
  performance: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    auc?: number;
    mse?: number;
    mae?: number;
    r2?: number;
    crossValidation: {
      folds: number;
      meanScore: number;
      stdScore: number;
      scores: number[];
    };
    confusionMatrix?: number[][];
    featureImportance?: Array<{
      feature: string;
      importance: number;
    }>;
  };
  
  /** Deployment configuration */
  deployment: {
    status: 'development' | 'staging' | 'production' | 'deprecated';
    endpoints: string[];
    scalingConfig: {
      minInstances: number;
      maxInstances: number;
      targetCPU: number;
      targetMemory: number;
    };
    monitoringConfig: {
      enabled: boolean;
      alertThresholds: {
        accuracy: number;
        latency: number;
        errorRate: number;
      };
    };
  };
  
  /** Model lineage */
  lineage: {
    parentModels?: string[];
    dependencies: string[];
    experiments: Array<{
      id: string;
      date: Date;
      parameters: Record<string, any>;
      results: Record<string, number>;
    }>;
  };
  
  /** Metadata */
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    description?: string;
    notes?: string;
  };
}

/**
 * ML training configuration
 */
export interface MLTrainingConfig {
  /** Training parameters */
  training: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: string;
    lossFunction: string;
    metrics: string[];
    earlyStopping?: {
      enabled: boolean;
      patience: number;
      minDelta: number;
      monitor: string;
    };
  };
  
  /** Data configuration */
  data: {
    sources: string[];
    preprocessing: Array<{
      step: string;
      params: Record<string, any>;
    }>;
    augmentation?: Array<{
      technique: string;
      probability: number;
      params: Record<string, any>;
    }>;
    validation: {
      strategy: 'holdout' | 'k-fold' | 'stratified';
      ratio: number;
      randomSeed?: number;
    };
  };
  
  /** Resource configuration */
  resources: {
    gpuRequired: boolean;
    memoryGB: number;
    maxTrainingTime: number;
    parallelJobs?: number;
  };
  
  /** Experiment tracking */
  experiment: {
    name: string;
    description?: string;
    tags: string[];
    hyperparameterTuning?: {
      enabled: boolean;
      strategy: 'grid' | 'random' | 'bayesian';
      searchSpace: Record<string, any>;
      maxTrials: number;
    };
  };
}