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

// ParsedCV type for compatibility
export interface ParsedCV {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
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
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationDate?: string;
    gpa?: string;
    honors?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    achievements?: string[];
  }>;
  achievements?: string[];
  references?: Array<{
    name: string;
    position: string;
    company: string;
    contact: string;
  }>;
  [key: string]: any;
}