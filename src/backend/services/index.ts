/**
 * Backend services for CV processing
 * 
 * This module exports all backend services related to CV processing:
 * - AI integration services
 * - PDF generation services  
 * - CV analysis services
 * - Processing workflow services
 */

// Core CV Processing Services
export * from './cv-parser.service';
export * from './pii-detector.service';
export * from './cv-generation.service';
export * from './enhancement-processing.service';

// Additional services will be exported here as they are migrated
// export * from './ats-optimization.service';
// export * from './skills-visualization.service';

// Package metadata
export const CV_PROCESSING_SERVICES_VERSION = '1.0.0';