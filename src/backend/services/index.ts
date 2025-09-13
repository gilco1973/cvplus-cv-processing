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

// Additional services
export * from './ats-optimization.service';
export * from './skills-visualization.service';
export * from './safe-firestore.service';
export * from './timeline-generation.service';
export * from './industry-specialization.service';
export * from './regional-localization.service';
export * from './prediction-model.service';
export * from './admin-access.service';
export * from './autonomous-auth.service';
export * from './language-proficiency.service';
export * from './additional-services';
export * from './policy-enforcement.service';

// Package metadata
export const CV_PROCESSING_SERVICES_VERSION = '1.0.0';