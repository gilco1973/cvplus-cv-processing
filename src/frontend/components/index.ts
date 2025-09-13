/**
 * React components for CV processing
 * 
 * This module exports all React components related to CV processing:
 * - CV upload components
 * - CV editing components
 * - CV preview components
 * - Processing status components
 * - CV analysis and display components
 * - CV comparison and enhancement components
 */

// Core CV Components
export * from './CVPreview';
export * from './FileUpload';
export * from './CVUpload';
export * from './ProcessingStatus';
export * from './CVAnalysisResults';
export { CVAnalysisResults as CVAnalysisDisplay } from './CVAnalysisResults'; // Alias for backward compatibility
export * from './CVProcessingProvider';
export * from './GeneratedCVDisplay';
export * from './GeneratedCVDisplayLazy';
export * from './LivePreview';

// CV Preview Module
export * from './cv-preview';

// CV Comparison Module  
export * from './cv-comparison';

// Editors
export * from './editors/QRCodeEditor';
export * from './editors/SectionEditor';

// Enhancement Components
export * from './enhancement/CVPreviewPanel';
export * from './enhancement/ProgressVisualization';

// Display Components
export * from './display/CVContentDisplay';

// Common CV Components
export * from './common/CVPreviewLayout';
export * from './common/CVPreviewSkeleton';

// Version identifier
export const CV_PROCESSING_COMPONENTS_VERSION = '2.0.0';