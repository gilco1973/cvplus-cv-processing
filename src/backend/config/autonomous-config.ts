// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Autonomous Backend Configuration
 * Replaces @cvplus/core/config dependencies for independent operation
 */

/**
 * CORS configuration for autonomous operation
 * Replaces corsOptions from @cvplus/core/config
 */
export const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://cvplus.app',
    'https://www.cvplus.app',
    'https://app.cvplus.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ]
};

/**
 * Environment detection
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * API Configuration
 */
export const apiConfig = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
};

/**
 * Firebase Function Configuration
 */
export const functionConfig = {
  region: 'us-central1',
  memory: '1GB' as const,
  timeout: 300, // 5 minutes
  maxInstances: 1000,
  minInstances: isDevelopment ? 0 : 1
};

/**
 * Rate Limiting Configuration
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false
};

/**
 * Security Configuration
 */
export const securityConfig = {
  validateOrigin: !isDevelopment,
  sanitizeInput: true,
  logSensitiveData: false,
  requireHttps: isProduction,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key'
};

/**
 * Cache Configuration
 */
export const cacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxEntries: 1000,
  checkPeriod: 60 * 1000, // 1 minute cleanup
  enabled: true
};