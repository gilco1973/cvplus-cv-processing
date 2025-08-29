/**
 * Authentication Guard Middleware for CV Processing Functions
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export interface AuthenticatedRequest extends functions.https.Request {
  user?: admin.auth.DecodedIdToken;
  uid?: string;
}

/**
 * Middleware to require authentication for Firebase Functions
 */
export const requireAuth = async (req: AuthenticatedRequest, res: functions.Response, next: () => void) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized - Missing or invalid authorization header' });
      return;
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = decodedToken;
    req.uid = decodedToken.uid;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

/**
 * Extract user ID from authenticated request
 */
export const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.uid) {
    throw new Error('User not authenticated');
  }
  return req.uid;
};

/**
 * Check if user has admin privileges
 */
export const requireAdmin = async (req: AuthenticatedRequest, res: functions.Response, next: () => void) => {
  try {
    await requireAuth(req, res, () => {});
    
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin custom claims
    if (!req.user.admin) {
      res.status(403).json({ error: 'Forbidden - Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(403).json({ error: 'Forbidden' });
  }
};