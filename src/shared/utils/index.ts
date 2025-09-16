// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Shared utilities for CV processing
 * 
 * This module exports utility functions that can be used by both
 * frontend and backend components:
 * - CV validation utilities
 * - Processing helpers
 * - Format conversion utilities
 * - Service management utilities
 */

import { CVData, CVStatus, ProcessingType } from '../types';

// Export service utilities
export * from './base-service';
export * from './service-registry';
export * from './cv-generation-helpers';

/**
 * Validate CV data structure
 */
export function validateCVData(data: any): data is CVData {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.userId === 'string' &&
    typeof data.content === 'string' &&
    Object.values(CVStatus).includes(data.status)
  );
}

/**
 * Check if CV processing is in progress
 */
export function isProcessingInProgress(status: CVStatus): boolean {
  return status === CVStatus.PENDING || status === CVStatus.PROCESSING;
}

/**
 * Check if CV processing is completed
 */
export function isProcessingCompleted(status: CVStatus): boolean {
  return status === CVStatus.COMPLETED;
}

/**
 * Check if CV processing has failed
 */
export function isProcessingFailed(status: CVStatus): boolean {
  return status === CVStatus.FAILED;
}

/**
 * Get processing type display name
 */
export function getProcessingTypeDisplayName(type: ProcessingType): string {
  const displayNames = {
    [ProcessingType.ANALYSIS]: 'Analysis',
    [ProcessingType.GENERATION]: 'Generation',
    [ProcessingType.ENHANCEMENT]: 'Enhancement',
    [ProcessingType.OPTIMIZATION]: 'Optimization'
  };
  
  return displayNames[type] || type;
}

/**
 * Generate unique processing ID
 */
export function generateProcessingId(): string {
  return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize CV content for processing
 */
export function sanitizeCVContent(content: string): string {
  // Basic sanitization - remove excessive whitespace and normalize line breaks
  return content
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ');
}