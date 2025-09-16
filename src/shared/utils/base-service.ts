// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Base Service Class
 * 
 * Abstract base class for all CV processing services.
 * Provides common functionality like logging, error handling, and result formatting.
 * 
 * @author Gil Klainert
 * @version 2.0.0 - Modularized Architecture
 */

import { ServiceResult } from '../../types';

export abstract class BaseService {
  protected readonly serviceName: string;
  protected readonly version: string;
  protected readonly startTime: number;

  constructor(serviceName: string, version: string) {
    this.serviceName = serviceName;
    this.version = version;
    this.startTime = Date.now();
    console.log(`🔧 Initializing ${serviceName} service v${version}`);
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    return {
      name: this.serviceName,
      version: this.version,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Create a successful service result
   */
  protected createSuccessResult<T>(data: T, message?: string): ServiceResult<T> {
    return {
      success: true,
      data,
      message: message || 'Operation completed successfully',
      timestamp: new Date(),
      service: this.serviceName,
      version: this.version
    };
  }

  /**
   * Create an error service result
   */
  protected createErrorResult<T = any>(
    message: string, 
    error?: Error | any, 
    code?: string
  ): ServiceResult<T> {
    const errorDetails = error ? {
      name: error.name || 'Unknown Error',
      message: error.message || 'Unknown error occurred',
      stack: error.stack
    } : undefined;

    return {
      success: false,
      message,
      error: errorDetails,
      code,
      timestamp: new Date(),
      service: this.serviceName,
      version: this.version
    };
  }

  /**
   * Log service activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.serviceName}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
        break;
      case 'warn':
        console.warn(logMessage, data ? JSON.stringify(data, null, 2) : '');
        break;
      case 'error':
        console.error(logMessage, data ? JSON.stringify(data, null, 2) : '');
        break;
    }
  }

  /**
   * Validate required parameters
   */
  protected validateRequired(params: Record<string, any>, requiredFields: string[]): string[] {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (params[field] === undefined || params[field] === null || params[field] === '') {
        errors.push(`${field} is required`);
      }
    }

    return errors;
  }

  /**
   * Measure execution time
   */
  protected async measureExecution<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    this.log('info', `Starting ${operationName}`);
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      this.log('info', `Completed ${operationName} in ${duration}ms`);
      return { result, duration };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.log('error', `Failed ${operationName} after ${duration}ms`, error);
      throw error;
    }
  }

  /**
   * Safe JSON parsing
   */
  protected safeJsonParse(jsonString: string, defaultValue: any = null): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      this.log('warn', `Failed to parse JSON: ${jsonString}`, error);
      return defaultValue;
    }
  }

  /**
   * Sanitize sensitive data for logging
   */
  protected sanitizeForLog(data: any): any {
    if (!data) return data;
    
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Common sensitive fields to redact
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'email', 'phone', 
      'ssn', 'credit', 'apiKey', 'accessToken', 'refreshToken'
    ];

    function redactSensitive(obj: any): any {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          obj[key] = redactSensitive(obj[key]);
        } else if (sensitiveFields.some(field => 
          key.toLowerCase().includes(field.toLowerCase())
        )) {
          obj[key] = '[REDACTED]';
        }
      }
      return obj;
    }

    return redactSensitive(sanitized);
  }
}