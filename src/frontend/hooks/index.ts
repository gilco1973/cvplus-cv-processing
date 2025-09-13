/**
 * Custom React hooks for CV processing
 * 
 * This module exports all custom hooks related to CV processing:
 * - CV upload hooks
 * - CV processing hooks
 * - CV analysis hooks
 * - CV generation hooks
 */

// Export created hooks
export * from './useCVUpload';
export * from './useCVProcessing';
export * from './useAchievementAnalysis';
export * from './useCVComparison';

// Alias for backward compatibility
export { useAchievementAnalysis as useCVAnalysis } from './useAchievementAnalysis';

// Hooks will be exported here as they are created/migrated
// export * from './useCVAnalysis';
// export * from './useCVGeneration';

// Placeholder exports to prevent build errors
export const CV_PROCESSING_HOOKS_VERSION = '1.0.0';