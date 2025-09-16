// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Autonomous Core Types
 * Replaces @cvplus/core/types dependencies for independent operation
 */

export interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    summary?: string;
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    achievements?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
    tools?: string[];
    frameworks?: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    link?: string;
  }>;
  publications?: Array<{
    title: string;
    publisher: string;
    date: string;
    link?: string;
  }>;
  awards?: Array<{
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
}

export interface CVParsedData extends CVData {
  id: string;
  fileName: string;
  parseDate: string;
  source: 'upload' | 'url' | 'paste';
  confidence: number;
  warnings?: string[];
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    fileSize?: number;
    language?: string;
  };
}

export interface ParsedCV extends CVParsedData {
  // Alias for backward compatibility
}

export interface CVGenerationOptions {
  template: string;
  format: 'pdf' | 'docx' | 'html';
  style?: {
    colorScheme?: string;
    fontFamily?: string;
    fontSize?: number;
    spacing?: 'compact' | 'normal' | 'spacious';
  };
  sections?: {
    includeSummary?: boolean;
    includeProjects?: boolean;
    includeCertifications?: boolean;
    includePublications?: boolean;
    includeAwards?: boolean;
  };
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  processingTime?: number;
  metadata?: {
    version: string;
    timestamp: string;
    processingStage: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score?: number;
}

export interface FileUploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ProcessingProgress {
  stage: string;
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number;
  startTime: string;
  currentTime: string;
}