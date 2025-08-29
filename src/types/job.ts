/**
 * Job Type Definitions
 * Autonomous types for CV processing jobs
 */

export interface Job {
  id: string;
  userId?: string;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  features: string[];
  userInstructions?: string;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobProgress {
  jobId: string;
  stage: string;
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export interface JobResult {
  jobId: string;
  cvData: any;
  analysis: any;
  recommendations: any;
  generatedFiles?: {
    pdf?: string;
    docx?: string;
    html?: string;
  };
}