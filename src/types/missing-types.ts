// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Missing types definitions for CV processing
 * This file provides type definitions that are missing and causing errors
 */

// Anthropic API types
export interface ContentBlock {
  type: 'text' | 'tool_use';
  text?: string;
  name?: string;
  input?: any;
}

export interface TextBlock extends ContentBlock {
  type: 'text';
  text: string;
}

export interface ToolUseBlock extends ContentBlock {
  type: 'tool_use';
  name: string;
  input: any;
}

// Firebase Functions types
export interface AuthenticatedRequest {
  auth?: {
    uid: string;
    token?: any;
  };
  data: any;
  rawRequest?: any;
}

// Achievement types
export interface AchievementHighlighting {
  id: string;
  title: string;
  description: string;
  impact?: string;
  metrics?: string[];
  context?: string;
  keywords?: string[];
  score?: number;
  category?: string;
  priority?: number;
  data?: any; // Add the missing data property
}

// Orchestration types
export interface OrchestrationRequest {
  type: string;
  data: any;
  options?: any;
  sources: string[];
}

export interface OrchestrationResult {
  status: 'success' | 'error' | 'partial' | 'failed';
  data?: any;
  errors?: string[];
  sourcesQueried: number;
  sourcesSuccessful: number;
  cacheHits: number;
  requestId: string;
  enrichedData?: any;
  fetchDuration: number;
}

// External data usage event types
export interface ExternalDataUsageEvent {
  userId: string;
  action?: string;
  timestamp: Date;
  metadata?: any;
  sources: string[];
  premiumStatus: boolean;
  fetchDuration: number;
  requestId?: string; // Added to match usage
  success?: boolean; // Added to match usage
  cvId?: string; // Added to match usage
  sourcesQueried?: number; // Added to match usage
  sourcesSuccessful?: number; // Added to match usage
  cacheHits?: number; // Added to match usage
  errors?: string[]; // Added to match usage
}

// Enhanced ATS Analysis Service types
export interface EnhancedATSAnalysisService {
  analyzeForATS(cvData: any, jobDescription?: string): Promise<any>;
  generateRecommendations(analysis: any): Promise<any>;
  scoreCV(cvData: any): Promise<number>;
}

// CV Data types for compatibility
export interface CVData {
  id: string;
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
    duration?: string;
    startDate?: string;
    endDate?: string;
    location: string;
    description?: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate?: string;
    endDate?: string;
    graduationDate?: string;
    gpa?: string;
    honors?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
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
}

// Job types
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  level?: 'entry' | 'mid' | 'senior' | 'executive';
  skills?: string[];
  benefits?: string[];
  postedDate?: Date;
  applicationDeadline?: Date;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: {
    notifications: boolean;
    privacy: {
      profileVisibility: 'public' | 'private';
      showEmail: boolean;
    };
  };
  subscription?: {
    plan: 'free' | 'premium' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
  };
}

// Calendar types
export interface Calendar {
  id: string;
  name: string;
  description?: string;
  timezone: string;
  events: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  attendees?: string[];
}

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type NonNullable<T> = T extends null | undefined ? never : T;

// Request/Response types for Firebase Functions
export interface CallableRequest<T = any> {
  data: T;
  auth?: {
    uid: string;
    token?: any;
  };
}

export interface CallableResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Enrichment types
export interface EnrichCVRequest {
  cvData: CVData;
  sources?: string[];
  options?: {
    includeLinkedIn?: boolean;
    includeGitHub?: boolean;
    includePublications?: boolean;
    includeProjects?: boolean;
  };
}

export interface EnrichCVResponse {
  success: boolean;
  enrichedData?: Partial<CVData>;
  sources?: {
    linkedin?: any;
    github?: any;
    publications?: any[];
    projects?: any[];
  };
  metadata?: {
    processingTime: number;
    sourcesQueried: number;
    sourcesSuccessful: number;
    cacheHits: number;
  };
}

// Configuration types
export interface CVProcessingConfig {
  ai?: {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  features?: {
    achievementHighlighting?: boolean;
    atsOptimization?: boolean;
    skillsAnalysis?: boolean;
    roleDetection?: boolean;
  };
  output?: {
    formats?: ('pdf' | 'html' | 'docx')[];
    templates?: string[];
  };
  [key: string]: any;
}

// Headers type for better compatibility
export interface CustomHeaders {
  Authorization?: string;
  'Content-Type'?: string;
  Accept?: string;
  'User-Agent'?: string;
  [key: string]: string | undefined;
}

// Integration types
export interface ParentIntegrationMessage {
  type: 'job-started' | 'job-completed' | 'job-failed' | 'navigation-request' | 'request-config';
  data: any;
  timestamp?: number;
}

// Note: Module declarations removed to fix compilation errors
// These modules don't exist and were causing build issues
