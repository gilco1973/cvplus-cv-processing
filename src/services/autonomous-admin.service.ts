// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Autonomous Admin Service
 * Provides basic admin access control for autonomous operation
 */
import { AuthenticationError } from '../utils/autonomous-utils';
import * as admin from 'firebase-admin';

export class AutonomousAdminService {
  private static db = admin.firestore();

  /**
   * Check if user has admin access
   */
  static async requireAdminAccess(userId: string): Promise<void> {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData?.isAdmin) {
        throw new AuthenticationError('Admin access required', 'ADMIN_ACCESS_DENIED');
      }
      
      // Additional checks can be added here
      if (userData.disabled) {
        throw new AuthenticationError('Admin account is disabled', 'ADMIN_DISABLED');
      }
      
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      console.error('Admin access check failed:', error);
      throw new AuthenticationError('Admin access verification failed', 'ADMIN_CHECK_FAILED');
    }
  }

  /**
   * Check if user is admin (without throwing)
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      return !!(userData?.isAdmin && !userData.disabled);
    } catch (error) {
      console.error('Admin check failed:', error);
      return false;
    }
  }

  /**
   * Get admin level for user
   */
  static async getAdminLevel(userId: string): Promise<'none' | 'basic' | 'super'> {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData?.isAdmin || userData.disabled) {
        return 'none';
      }
      
      return userData.adminLevel || 'basic';
    } catch (error) {
      console.error('Admin level check failed:', error);
      return 'none';
    }
  }

  /**
   * Log admin action
   */
  static async logAdminAction(userId: string, action: string, details?: Record<string, any>): Promise<void> {
    try {
      await this.db.collection('admin_logs').add({
        userId,
        action,
        details: details || {},
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ip: details?.ip,
        userAgent: details?.userAgent
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw - logging failures shouldn't break functionality
    }
  }
}

// Export for backward compatibility
export const AdminAccessService = AutonomousAdminService;