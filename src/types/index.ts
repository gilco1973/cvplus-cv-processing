// @ts-ignore
/**
 * Package-specific types for CV processing
 * 
 * This module exports types that are specific to this package:
 * - Function-specific request/response types
 * - Internal service types
 * - Configuration types
  */

import { ProcessingRequest, ProcessingResponse, ProcessingType } from '../shared/types';

// Export migrated types from core
export * from './role-profile.types';
export * from './industry-specialization';

// CV Generation Types
export interface CVGenerationRequest extends ProcessingRequest {
  type: ProcessingType;
  data: {
    personalInfo: PersonalInfo;
    experience: WorkExperience[];
    education: Education[];
    skills: string[];
    templateId?: string;
  };
}

export interface CVGenerationResponse extends ProcessingResponse {
  data?: {
    cvId: string;
    pdfUrl: string;
    htmlContent: string;
  };
}

// CV Processing Types
export interface CVProcessingRequest extends ProcessingRequest {
  type: ProcessingType;
  data: {
    cvId: string;
    operations: ProcessingOperation[];
  };
}

export interface CVProcessingResponse extends ProcessingResponse {
  data?: {
    cvId: string;
    updatedContent: string;
    appliedOperations: string[];
  };
}

// CV Analysis Types
export interface CVAnalysisRequest extends ProcessingRequest {
  type: ProcessingType;
  data: {
    cvContent: string;
    analysisType: AnalysisType[];
  };
}

export interface CVAnalysisResponse extends ProcessingResponse {
  data?: {
    score: number;
    suggestions: Suggestion[];
    keywords: string[];
    sections: CVSection[];
  };
}

// Supporting types
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  linkedIn?: string;
  website?: string;
  summary?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  honors?: string[];
}

export interface ProcessingOperation {
  type: 'enhance' | 'optimize' | 'translate' | 'format';
  parameters?: Record<string, any>;
}

export enum AnalysisType {
  CONTENT = 'content',
  FORMAT = 'format',
  KEYWORDS = 'keywords',
  ATS_SCORE = 'ats_score',
  READABILITY = 'readability'
}

export interface Suggestion {
  type: 'improvement' | 'warning' | 'error';
  section: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CVSection {
  name: string;
  content: string;
  score: number;
  suggestions: string[];
}

// RAG and Embedding Types for CV Processing
export interface RAGEmbedding {
  id: string;
  vector: number[];
  metadata: {
    section: string;
    content: string;
    chunkIndex: number;
    totalChunks: number;
    tokens: number;
  };
  createdAt: Date;
}

export interface EmbeddingMetadata {
  section: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
  tokens: number;
}

export interface ContentType {
  type: 'text' | 'section' | 'experience' | 'education' | 'skills';
  priority: number;
}

// Service configuration types
export interface AIServiceConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface PDFServiceConfig {
  templatePath: string;
  outputFormat: 'pdf' | 'html' | 'both';
  quality: 'low' | 'medium' | 'high';
}

// Additional types for migrated functions
export interface CVPreviewRequest {
  jobId: string;
  templateId?: string;
  features?: string[];
}

export interface CVPreviewResponse {
  success: boolean;
  data?: any;
  template?: string;
  features?: string[];
  timestamp?: string;
}

export interface CVInitiationRequest {
  jobId: string;
  templateId?: string;
  features?: string[];
}

export interface CVInitiationResponse {
  success: boolean;
  jobId?: string;
  status?: string;
  selectedFeatures?: string[];
  estimatedTime?: number;
  message?: string;
}

export interface EnhancedAnalysisRequest {
  parsedCV: any;
  targetRole?: string;
  jobDescription?: string;
  industryKeywords?: string[];
  jobId?: string;
}

export interface EnhancedAnalysisResponse {
  success: boolean;
  analysis?: string;
  enhancedAnalysis?: any;
}

export interface UpdateCVDataRequest {
  jobId: string;
  updateData: {
    profilePicture?: {
      url: string;
      path: string;
      uploadedAt: string;
    };
    personalInfo?: {
      [key: string]: any;
    };
    [key: string]: any;
  };
  updateType: string;
}

export interface UpdateCVDataResponse {
  success: boolean;
  message: string;
  updatedData?: any;
  error?: string;
}

export interface ATSAnalysisRequest {
  jobId: string;
  targetRole?: string;
  targetKeywords?: string[];
}

export interface ATSAnalysisResponse {
  success: boolean;
  atsScore?: any;
  recommendations?: any[];
}

export interface SkillsVisualizationRequest {
  jobId: string;
  settings?: {
    chartTypes?: Array<'radar' | 'bar' | 'bubble' | 'treemap'>;
    includeProgress?: boolean;
    includeEndorsements?: boolean;
  };
}

export interface SkillsVisualizationResponse {
  success: boolean;
  visualization?: any;
  htmlFragment?: string | null;
}

// PII Detection Types
export interface PIIDetectionResult {
  hasPII: boolean;
  detectedTypes: string[];
  maskedData?: any;
  recommendations: string[];
}

export interface PIIMaskingOptions {
  maskEmails?: boolean;
  maskPhones?: boolean;
  maskAddresses?: boolean;
  maskSSN?: boolean;
  maskCreditCards?: boolean;
  maskBankAccounts?: boolean;
  maskPassportNumbers?: boolean;
  maskDriversLicense?: boolean;
  keepFirstName?: boolean;
  keepLastName?: boolean;
  keepCity?: boolean;
  keepCountry?: boolean;
}

// Service Result Types
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  code?: string;
  timestamp?: Date;
  service?: string;
  version?: string;
}

// CV Processing Context Type
export interface CVProcessingContext {
  jobId: string;
  userId: string;
  cvData: any;
  templateId?: string;
  features?: string[];
  metadata?: {
    startTime: Date;
    version: string;
    [key: string]: any;
  };
}

// Service Interface Type moved to shared/utils/service-registry.ts to avoid duplication

// Enhanced models - specific exports to avoid conflicts (placeholders for missing types)
export type PredictionModels = any; // Placeholder for missing type
export type IndustryInsights = any; // Placeholder for missing type  
export type RecommendationEngine = any; // Placeholder for missing type

// Missing types - specific exports to avoid conflicts
export type {
  OrchestrationRequest,
  OrchestrationResult,
  ExternalDataUsageEvent,
  CVProcessingConfig,
  CustomHeaders,
  ParentIntegrationMessage
} from './missing-types';

// ParsedCV Type (also exported as CVParsedData for compatibility)
export interface ParsedCV {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
    location: string;
    description?: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate?: string;
    endDate?: string;
    graduationDate?: string;
    gpa?: string;
    honors?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  achievements?: string[];
  references?: Array<{
    name: string;
    position: string;
    company: string;
    contact: string;
  }>;
}

// Export CVParsedData as alias for compatibility
export type CVParsedData = ParsedCV;

// Additional type aliases for backward compatibility
export type ProcessingResult = any; // Generic processing result type
export type CVAnalysis = CVAnalysisResponse; // Alias for CVAnalysisResponse
export type { AchievementHighlighting } from './enhanced-models'; // Re-export from enhanced-models
export type CVData = any; // Generic CV data type
export type Job = any; // Generic job type
export type User = any; // Generic user type

// NOTE: api, booking.types, and payment.types files were removed as they don't belong to CV processing module
// If these exports are needed, they should be imported from their respective modules:
// - API types from @cvplus/core
// - Booking types from @cvplus/workflow
// - Payment types from @cvplus/payments
