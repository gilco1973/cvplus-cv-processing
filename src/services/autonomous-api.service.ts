// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Autonomous API Service
 * Handles independent backend communication
 */
import type { 
  CVData, 
  CVParsedData, 
  ProcessingResult, 
  UploadResult
} from '../types/autonomous-cv.types';
import { CVProcessingError, retry } from '../utils/autonomous-utils';
import type { AutonomousAuthService as AuthService } from '../backend/services/cv-generator/integrations/AuthIntegration';

export interface APIService {
  processCV(file: File, jobId?: string): Promise<ProcessingResult>;
  generatePreview(cvId: string, template?: string): Promise<{ previewUrl: string; previewData: CVParsedData }>;
  saveCV(cvData: CVData): Promise<{ success: boolean; id: string }>;
  getCVHistory(): Promise<CVData[]>;
  analyzeCV(cvData: CVData, jobDescription?: string): Promise<any>;
  optimizeForATS(cvData: CVData, jobDescription: string): Promise<any>;
}

export interface APIConfiguration {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  _enableFallback?: boolean;
}

export class AutonomousAPIService implements APIService {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private authService: AuthService;
  private _enableFallback: boolean;

  constructor(config: APIConfiguration, authService: AuthService) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.authService = authService;
    this._enableFallback = config._enableFallback ?? true;
  }

  async processCV(file: File, jobId?: string): Promise<ProcessingResult> {
    try {
      // Step 1: Upload file to storage
      const uploadResult = await this.uploadFile(file, `cv-uploads/${Date.now()}-${file.name}`);
      
      if (!uploadResult.success) {
        throw new CVProcessingError(
          'File upload failed',
          'UPLOAD_ERROR',
          { error: uploadResult.error }
        );
      }

      // Step 2: Process CV via Firebase Function
      const processData = {
        jobId: jobId || `job_${Date.now()}`,
        fileUrl: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };

      const response = await this.authenticatedRequest('/processCV', {
        method: 'POST',
        body: JSON.stringify(processData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new CVProcessingError(
          errorData.error || 'CV processing failed',
          'PROCESSING_ERROR',
          { 
            status: response.status,
            statusText: response.statusText,
            details: errorData
          }
        );
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.parsedData,
        warnings: result.warnings || [],
        recommendations: result.recommendations || []
      };

    } catch (error) {
      if (error instanceof CVProcessingError) {
        throw error;
      }
      
      throw new CVProcessingError(
        error instanceof Error ? error.message : 'Unknown processing error',
        'PROCESSING_FAILED',
        { originalError: error }
      );
    }
  }

  async generatePreview(cvId: string, template?: string): Promise<{ previewUrl: string; previewData: CVParsedData }> {
    try {
      const response = await this.authenticatedRequest('/generateCVPreview', {
        method: 'POST',
        body: JSON.stringify({
          cvId,
          template: template || 'modern-professional'
        })
      });

      if (!response.ok) {
        throw new CVProcessingError(
          'Preview generation failed',
          'PREVIEW_ERROR',
          { status: response.status }
        );
      }

      const result = await response.json();
      return {
        previewUrl: result.previewUrl,
        previewData: result.previewData
      };

    } catch (error) {
      throw new CVProcessingError(
        error instanceof Error ? error.message : 'Preview generation failed',
        'PREVIEW_FAILED',
        { originalError: error }
      );
    }
  }

  async saveCV(cvData: CVData): Promise<{ success: boolean; id: string }> {
    try {
      const response = await this.authenticatedRequest('/saveCV', {
        method: 'POST',
        body: JSON.stringify({ cvData })
      });

      if (!response.ok) {
        throw new CVProcessingError(
          'CV save failed',
          'SAVE_ERROR',
          { status: response.status }
        );
      }

      const result = await response.json();
      return {
        success: true,
        id: result.id
      };

    } catch (error) {
      throw new CVProcessingError(
        error instanceof Error ? error.message : 'CV save failed',
        'SAVE_FAILED',
        { originalError: error }
      );
    }
  }

  async getCVHistory(): Promise<CVData[]> {
    try {
      const response = await this.authenticatedRequest('/getCVHistory', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new CVProcessingError(
          'Failed to fetch CV history',
          'HISTORY_ERROR',
          { status: response.status }
        );
      }

      const result = await response.json();
      return result.cvHistory || [];

    } catch (error) {
      console.warn('Failed to fetch CV history:', error);
      return []; // Return empty array on failure
    }
  }

  async analyzeCV(cvData: CVData, jobDescription?: string): Promise<any> {
    try {
      const response = await this.authenticatedRequest('/enhancedAnalyzeCV', {
        method: 'POST',
        body: JSON.stringify({
          cvData,
          jobDescription,
          analysisType: 'comprehensive'
        })
      });

      if (!response.ok) {
        throw new CVProcessingError(
          'CV analysis failed',
          'ANALYSIS_ERROR',
          { status: response.status }
        );
      }

      return await response.json();

    } catch (error) {
      throw new CVProcessingError(
        error instanceof Error ? error.message : 'CV analysis failed',
        'ANALYSIS_FAILED',
        { originalError: error }
      );
    }
  }

  async optimizeForATS(cvData: CVData, jobDescription: string): Promise<any> {
    try {
      const response = await this.authenticatedRequest('/atsOptimization', {
        method: 'POST',
        body: JSON.stringify({
          cvData,
          jobDescription,
          optimizationType: 'comprehensive'
        })
      });

      if (!response.ok) {
        throw new CVProcessingError(
          'ATS optimization failed',
          'ATS_ERROR',
          { status: response.status }
        );
      }

      return await response.json();

    } catch (error) {
      throw new CVProcessingError(
        error instanceof Error ? error.message : 'ATS optimization failed',
        'ATS_FAILED',
        { originalError: error }
      );
    }
  }

  private async uploadFile(file: File, path: string): Promise<UploadResult> {
    try {
      // For Firebase Storage, we'll use the Firebase Storage SDK
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      const response = await this.authenticatedRequest('/uploadFile', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Upload failed with status ${response.status}`
        };
      }

      const result = await response.json();
      return {
        success: true,
        url: result.downloadUrl,
        path: result.filePath
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  private async authenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const user = this.authService.getCurrentUser();
    let token: string | null = null;

    if (user) {
      try {
        token = await this.authService.refreshToken();
      } catch (error) {
        console.warn('Failed to get auth token:', error);
        // Continue without token for public endpoints
      }
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {})
    };

    // Add auth header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add content-type if not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await retry(async () => {
        return fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal
        });
      }, this.retryAttempts);

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new CVProcessingError(
          `Request timeout after ${this.timeout}ms`,
          'TIMEOUT_ERROR'
        );
      }
      
      throw error;
    }
  }
}

// Factory function for easy instantiation
export function createAPIService(config: APIConfiguration, authService: AuthService): APIService {
  return new AutonomousAPIService(config, authService);
}

// Default configuration helper
export function createDefaultAPIConfig(baseURL?: string): APIConfiguration {
  return {
    baseURL: baseURL || process.env.VITE_API_BASE_URL || 'https://us-central1-cvplus-dev.cloudfunctions.net',
    timeout: 30000,
    retryAttempts: 3,
    _enableFallback: true
  };
}