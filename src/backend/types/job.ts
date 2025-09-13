/**
 * Job Types for Backend
 * 
 * Backend-specific job processing types.
 */

import type { CVData } from '../../shared/types';

// Re-export shared types
export * from '../../shared/types';

// Additional backend-specific types
export interface JobProcessingContext {
  userId: string;
  jobId: string;
  startTime: number;
  options?: JobProcessingOptions;
}

export interface JobProcessingOptions {
  skipCache?: boolean;
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
  retryCount?: number;
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
}

export interface BackendJob extends CVData {
  processingSteps: ProcessingStep[];
  context: JobProcessingContext;
}

// Legacy compatibility
export interface ParsedCV {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    description?: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  education: any[];
  skills: string[];
  languages?: string[];
  certifications?: any[];
  projects?: any[];
}