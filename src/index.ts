/**
 * CVPlus CV Processing Package
 * 
 * Main entry point for the CV processing module.
 * Provides both frontend and backend functionality for CV analysis, generation, and processing.
 */

// Export frontend components and hooks
export {
  CVUpload,
  CVPreview,
  CVAnalysisDisplay,
  CVProcessingProvider,
  ProcessingStatus,
  FileUpload,
  useCVProcessing,
  useCVAnalysis,
  useCVUpload,
  useAchievementAnalysis
} from './frontend';

// Export backend functions
export {
  processCV,
  generateCV,
  analyzeCV
} from './backend';

// Export shared utilities (avoiding type conflicts)
export {
  ServiceRegistry,
  CVGenerationHelpers
} from './shared';

// Export core types (explicit to avoid conflicts)
export type {
  CVProcessingConfig,
  ProcessingResult,
  CVAnalysis,
  AchievementHighlighting,
  CVData,
  Job,
  User
} from './types';

// Export CVUpload specific types
export type {
  CVUploadProps,
  CVProcessingFeature
} from './frontend/components/CVUpload';

// Package metadata
export const CV_PROCESSING_VERSION = '1.0.0';
export const CV_PROCESSING_NAME = '@cvplus/cv-processing';
// Migrated staging services
export { CVAnalysisService } from './services/cv/cv-analysis.service';
export { EnhancedATSAnalysisService } from './services/enhanced-ats-analysis.service';
export { PolicyEnforcementService } from './services/policy-enforcement.service';
export { CVGenerationService } from './services/cv/cv-generation.service';
export { CVTemplateService } from './services/cv/cv-template.service';
export { CVGenerator } from './services/cvGenerator';
export { CVValidationService } from './services/cv/cv-validation.service';
export { CVValidator } from './services/validation/cv-validator';
export { CVHashService } from './services/cv-hash.service';
export { EnhancementProcessingService } from './services/enhancements/enhancement-processing.service';
export * from './services/cv-generator/types';
