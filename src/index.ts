/**
 * CVPlus CV Processing Package
 * 
 * Main entry point for the CV processing module.
 * Provides both frontend and backend functionality for CV analysis, generation, and processing.
 */

// Export frontend components and hooks
export * from './frontend';

// Export backend functions and services
export * from './backend';

// Export shared types and utilities
export * from './shared';

// Export package-specific types
export * from './types';

// Package metadata
export const CV_PROCESSING_VERSION = '1.0.0';
export const CV_PROCESSING_NAME = '@cvplus/cv-processing';