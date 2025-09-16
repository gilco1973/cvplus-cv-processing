// @ts-ignore
/**
 * Local CORS Configuration
 * Replaces @cvplus/core/config for autonomous operation
  */

export interface CorsOptions {
  origin: string | string[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

// Default CORS configuration for development and production
export const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://cvplus.com',
    'https://www.cvplus.com',
    'https://app.cvplus.com',
    'https://cvplus-dev.web.app',
    'https://cvplus-dev.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-API-Key',
    'X-Client-Version'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Request-ID',
    'X-Response-Time'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Firebase Functions specific CORS configuration
export const firebaseFunctionsCorsOptions = {
  cors: corsOptions,
  allowCredentials: true,
  maxAge: 3600 // 1 hour for Firebase Functions
};

// Development-specific CORS (more permissive)
export const developmentCorsOptions: CorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Production-specific CORS (more restrictive)
export const productionCorsOptions: CorsOptions = {
  origin: [
    'https://cvplus.com',
    'https://www.cvplus.com',
    'https://app.cvplus.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type'
  ],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Function to get appropriate CORS options based on environment
export function getCorsOptions(): CorsOptions {
  const environment = process.env.NODE_ENV || 'development';
  const isDevelopment = environment === 'development' || 
                       process.env.FUNCTIONS_EMULATOR === 'true' ||
                       process.env.FIRESTORE_EMULATOR_HOST;

  if (isDevelopment) {
    return developmentCorsOptions;
  }

  return productionCorsOptions;
}

// Helper function for Express.js applications
export function setupCors(app: any): void {
  const corsConfig = getCorsOptions();
  
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    
    // Handle origin checking
    if (Array.isArray(corsConfig.origin)) {
      if (corsConfig.origin.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      }
    } else if (corsConfig.origin === true) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (typeof corsConfig.origin === 'string') {
      res.header('Access-Control-Allow-Origin', corsConfig.origin);
    }

    // Set other CORS headers
    if (corsConfig.credentials) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    if (corsConfig.methods) {
      res.header('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    }

    if (corsConfig.allowedHeaders) {
      res.header('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    }

    if (corsConfig.exposedHeaders) {
      res.header('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
    }

    if (corsConfig.maxAge) {
      res.header('Access-Control-Max-Age', corsConfig.maxAge.toString());
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(corsConfig.optionsSuccessStatus || 200).send();
      return;
    }

    next();
  });
}

// Helper function for manual CORS header setting
export function setCorsHeaders(res: any, req: any): void {
  const corsConfig = getCorsOptions();
  const origin = req.headers.origin;

  // Set origin
  if (Array.isArray(corsConfig.origin)) {
    if (corsConfig.origin.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else if (corsConfig.origin === true) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else if (typeof corsConfig.origin === 'string') {
    res.setHeader('Access-Control-Allow-Origin', corsConfig.origin);
  }

  // Set credentials
  if (corsConfig.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Set methods
  if (corsConfig.methods) {
    res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  }

  // Set allowed headers
  if (corsConfig.allowedHeaders) {
    res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  }

  // Set exposed headers
  if (corsConfig.exposedHeaders) {
    res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
  }

  // Set max age
  if (corsConfig.maxAge) {
    res.setHeader('Access-Control-Max-Age', corsConfig.maxAge);
  }
}

// Validation helper
export function isOriginAllowed(origin: string): boolean {
  const corsConfig = getCorsOptions();
  
  if (corsConfig.origin === true) {
    return true;
  }
  
  if (typeof corsConfig.origin === 'string') {
    return corsConfig.origin === origin;
  }
  
  if (Array.isArray(corsConfig.origin)) {
    return corsConfig.origin.includes(origin);
  }
  
  return false;
}

// Export for backward compatibility
export { corsOptions as default };
export const CORS_OPTIONS = corsOptions;