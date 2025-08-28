/**
 * Shared types for CV processing
 * 
 * This module exports types that are shared between frontend and backend:
 * - Common interfaces
 * - Shared enums
 * - API request/response types
 */

// Common CV processing types
export interface CVData {
  id: string;
  userId: string;
  content: string;
  metadata: CVMetadata;
  status: CVStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CVMetadata {
  originalFileName?: string;
  fileSize?: number;
  fileType?: string;
  processingVersion?: string;
  language?: string;
}

export enum CVStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum ProcessingType {
  ANALYSIS = 'analysis',
  GENERATION = 'generation',
  ENHANCEMENT = 'enhancement',
  OPTIMIZATION = 'optimization'
}

// API types
export interface ProcessingRequest {
  type: ProcessingType;
  data: any;
  options?: ProcessingOptions;
}

export interface ProcessingResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: ProcessingMetadata;
}

export interface ProcessingOptions {
  aiModel?: string;
  language?: string;
  templateId?: string;
  customOptions?: Record<string, any>;
}

export interface ProcessingMetadata {
  processingTime?: number;
  tokensUsed?: number;
  version?: string;
  timestamp?: Date;
}