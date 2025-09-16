// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Firebase Functions for CV processing
 *
 * This module exports all Firebase Functions related to CV processing:
 * - CV generation and analysis
 * - CV processing workflows
 * - AI-powered CV enhancement
 * - Professional terminology translation (moved from i18n)
 */

// =============================================================================
// CORE CV PROCESSING FUNCTIONS
// =============================================================================
export * from './uploadCV';
export * from './getCVStatus';
export * from './generateCV';
export * from './processCV';
export * from './analyzeCV';
export * from './generateCVPreview';
export * from './initiateCVGeneration';
export * from './enhancedAnalyzeCV';
export * from './updateCVData';
export * from './processCV.enhanced';

// CV API Functions (new structure)
export * from './cv/upload';
export * from './cv/download';
export * from './cv/status';
export * from './cv/url';

// =============================================================================
// CV OPTIMIZATION FUNCTIONS
// =============================================================================
export * from './atsOptimization';
export * from './skillsVisualization';

// =============================================================================
// CV ENHANCEMENT FUNCTIONS
// =============================================================================
export * from './achievementHighlighting';
export * from './enrichCVWithExternalData';
export * from './generateTimeline';
export * from './industryOptimization';
export * from './languageProficiency';
export * from './personalityInsights';
export * from './predictSuccess';
export * from './regionalOptimization';
export * from './advancedPredictions';

// =============================================================================
// CV TRANSLATION FUNCTIONS (moved from i18n)
// =============================================================================
export * from './translateCV';
export * from './translateProfessional';