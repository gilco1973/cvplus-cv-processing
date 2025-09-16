// @ts-ignore
/**
 * CORS Configuration for CV Processing Functions
  */

export const corsConfig = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://cvplus-dev.web.app',
    'https://cvplus-staging.web.app', 
    'https://cvplus.app',
    'https://www.cvplus.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * CORS options for Firebase Functions v2 format
  */
export const corsOptions = {
  cors: corsConfig.origin
};

/**
 * CORS middleware factory for Firebase Functions
  */
export const createCorsMiddleware = () => {
  return {
    ...corsConfig,
    optionsSuccessStatus: 200
  };
};

export default corsConfig;