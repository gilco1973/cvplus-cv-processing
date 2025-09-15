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

// Export migrated CV processing types
export type {
  CV,
  CVContent,
  CVMetadata,
  WorkExperience,
  Education,
  Skill,
  Achievement,
  Reference,
  CVTemplate,
  TemplateConfig,
  TemplateSection,
  TemplateStyle,
  EnhancedJob,
  EnhancedJobCore,
  JobFunction,
  EnhancedATS,
  EnhancedSkills
} from './types/cv';

export type {
  CVTemplate as CVTemplateType,
  CVTemplateMetadata,
  CVTemplateSections,
  CVTemplateOptions
} from './types/cv-template';

export type {
  Job as JobType,
  JobRequirements,
  JobBenefits,
  CompanyInfo
} from './types/job';

export type {
  JobFunction as JobFunctionType,
  JobFunctionCategory,
  JobFunctionData
} from './types/job-functions';

export type {
  EnhancedJob as EnhancedJobType,
  EnhancedJobAnalysis,
  EnhancedJobMatching
} from './types/enhanced-job';

export type {
  EnhancedJobCore as EnhancedJobCoreType,
  EnhancedJobCoreData,
  EnhancedJobCoreAnalysis
} from './types/enhanced-job-core';

export type {
  EnhancedATS as EnhancedATSType,
  ATSScore,
  ATSRecommendations,
  ATSCompatibility
} from './types/enhanced-ats';

export type {
  EnhancedSkills as EnhancedSkillsType,
  SkillCategory,
  SkillAnalysis,
  SkillRecommendations
} from './types/enhanced-skills';

// Package metadata
export const CV_PROCESSING_VERSION = '1.0.0';
export const CV_PROCESSING_NAME = '@cvplus/cv-processing';

// Migrated core CV processing services (working ones only)
export { CVAnalysisService } from './services/cv/cv-analysis.service';
export { CVGenerationService } from './services/cv/cv-generation.service';
export { CVTemplateService } from './services/cv/cv-template.service';
export { CVValidationService } from './services/cv/cv-validation.service';
export { EnhancementProcessingService } from './services/enhancements/enhancement-processing.service';
export { PiiDetector } from './services/piiDetector';

// Export cv-generator types (excluding problematic exports for now)
// export * from './services/cv-generator/types';

// Existing staging services (commenting out problematic ones for now)
// export { EnhancedATSAnalysisService } from './services/enhanced-ats-analysis.service';
// export { PolicyEnforcementService } from './services/policy-enforcement.service';
// export { CVValidator } from './services/validation/cv-validator';
// export { CVGenerator } from './services/cvGenerator';
export { CVHashService } from './services/cv-hash.service';