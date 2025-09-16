// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Autonomous Core Module
 * Local replacement for missing @cvplus/core dependency
 * Provides essential shared types, utilities, and configuration
 */

// Core configuration
export interface CoreConfig {
  apiUrl?: string;
  environment?: 'development' | 'staging' | 'production';
  version?: string;
}

export const coreConfig: CoreConfig = {
  apiUrl: '/api',
  environment: 'development',
  version: '1.0.0'
};

// Common types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  error?: string;
}

// Utility functions
export const createApiResponse = <T>(
  success: boolean, 
  data?: T, 
  error?: string, 
  message?: string
): ApiResponse<T> => ({
  success,
  data,
  error,
  message
});

export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) {
    const defaultDate = new Date().toISOString().split('T')[0];
    return defaultDate || '';
  }
  if (typeof date === 'string') {
    const parsed = new Date(date);
    const formattedDate = parsed.toISOString().split('T')[0];
    return formattedDate || '';
  }
  const formattedDate = date.toISOString().split('T')[0];
  return formattedDate || '';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeString = (str: string): string => 
  str.trim().replace(/[<>]/g, '');

// Error handling
export class CoreError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'CoreError';
  }
}

export const handleError = (error: unknown): CoreError => {
  if (error instanceof CoreError) {
    return error;
  }
  if (error instanceof Error) {
    return new CoreError(error.message);
  }
  return new CoreError('Unknown error occurred');
};

// Constants
export const CORE_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['pdf', 'doc', 'docx', 'txt'],
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  API_RETRY_COUNT: 3
} as const;

export default {
  config: coreConfig,
  createApiResponse,
  delay,
  formatDate,
  isValidEmail,
  sanitizeString,
  handleError,
  CORE_CONSTANTS
};