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