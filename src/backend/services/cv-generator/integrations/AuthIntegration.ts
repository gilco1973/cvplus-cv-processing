// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Auth Integration for CV Processing
 *
 * Provides integration layer for authentication services from @cvplus/auth and @cvplus/premium submodules.
 * Uses dependency injection pattern to avoid direct dependencies between same-layer modules.
 */

// Integration types for auth services
export interface AuthUser {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthRequest {
  auth?: any;
  data?: any;
}

export interface AutonomousAuthService {
  requireGoogleAuth(request: AuthRequest): Promise<AuthUser>;
  updateUserLastLogin(uid: string, email: string, name?: string, picture?: string): Promise<void>;
  validateUser(request: AuthRequest): Promise<AuthUser>;
}

export interface AuthGuard {
  authenticateUser(request: AuthRequest): Promise<AuthUser>;
  requireAuthentication(request: AuthRequest): Promise<AuthUser>;
}

export interface PremiumGuard {
  requirePremiumAccess(request: AuthRequest, featureId: string): Promise<AuthUser>;
  checkPremiumFeature(userId: string, featureId: string): Promise<boolean>;
}

export interface AuthProvider {
  createAutonomousAuthService(): AutonomousAuthService;
  createAuthGuard(): AuthGuard;
}

export interface PremiumProvider {
  createPremiumGuard(): PremiumGuard;
}

/**
 * Integration layer for auth services
 */
export class AuthIntegration {
  private static authProvider: AuthProvider | null = null;
  private static premiumProvider: PremiumProvider | null = null;

  /**
   * Set the auth provider (called by root application during startup)
   */
  static setAuthProvider(provider: AuthProvider): void {
    this.authProvider = provider;
  }

  /**
   * Set the premium provider (called by root application during startup)
   */
  static setPremiumProvider(provider: PremiumProvider): void {
    this.premiumProvider = provider;
  }

  /**
   * Get autonomous auth service from auth submodule
   */
  static getAutonomousAuthService(): AutonomousAuthService | null {
    if (!this.authProvider) {
      return null;
    }

    try {
      return this.authProvider.createAutonomousAuthService();
    } catch (error) {
      console.warn('Failed to create autonomous auth service:', error);
      return null;
    }
  }

  /**
   * Get auth guard from auth submodule
   */
  static getAuthGuard(): AuthGuard | null {
    if (!this.authProvider) {
      return null;
    }

    try {
      return this.authProvider.createAuthGuard();
    } catch (error) {
      console.warn('Failed to create auth guard:', error);
      return null;
    }
  }

  /**
   * Get premium guard from premium submodule
   */
  static getPremiumGuard(): PremiumGuard | null {
    if (!this.premiumProvider) {
      return null;
    }

    try {
      return this.premiumProvider.createPremiumGuard();
    } catch (error) {
      console.warn('Failed to create premium guard:', error);
      return null;
    }
  }

  /**
   * Create fallback autonomous auth service
   */
  static createFallbackAutonomousAuthService(): AutonomousAuthService {
    return new FallbackAutonomousAuthService();
  }

  /**
   * Create fallback auth guard
   */
  static createFallbackAuthGuard(): AuthGuard {
    return new FallbackAuthGuard();
  }

  /**
   * Create fallback premium guard
   */
  static createFallbackPremiumGuard(): PremiumGuard {
    return new FallbackPremiumGuard();
  }

  /**
   * Get autonomous auth service with fallback
   */
  static getAutonomousAuthServiceWithFallback(): AutonomousAuthService {
    return this.getAutonomousAuthService() || this.createFallbackAutonomousAuthService();
  }

  /**
   * Get auth guard with fallback
   */
  static getAuthGuardWithFallback(): AuthGuard {
    return this.getAuthGuard() || this.createFallbackAuthGuard();
  }

  /**
   * Get premium guard with fallback
   */
  static getPremiumGuardWithFallback(): PremiumGuard {
    return this.getPremiumGuard() || this.createFallbackPremiumGuard();
  }

  /**
   * Check if auth provider is available
   */
  static isAuthProviderAvailable(): boolean {
    return this.authProvider !== null;
  }

  /**
   * Check if premium provider is available
   */
  static isPremiumProviderAvailable(): boolean {
    return this.premiumProvider !== null;
  }
}

/**
 * Fallback autonomous auth service for when auth submodule is not available
 */
export class FallbackAutonomousAuthService implements AutonomousAuthService {
  async requireGoogleAuth(request: AuthRequest): Promise<AuthUser> {
    // Basic fallback authentication check
    if (!request.auth?.uid) {
      throw new Error('Authentication required (fallback mode)');
    }

    return {
      uid: request.auth.uid,
      email: request.auth.token?.email || 'unknown@fallback.com',
      name: request.auth.token?.name || 'Unknown User',
      picture: request.auth.token?.picture
    };
  }

  async updateUserLastLogin(uid: string, email: string, name?: string, picture?: string): Promise<void> {
    // Fallback - log but don't persist
    console.info('User login update (fallback mode):', { uid, email: email.substring(0, 5) + '***' });
  }

  async validateUser(request: AuthRequest): Promise<AuthUser> {
    return this.requireGoogleAuth(request);
  }
}

/**
 * Fallback auth guard for when auth submodule is not available
 */
export class FallbackAuthGuard implements AuthGuard {
  async authenticateUser(request: AuthRequest): Promise<AuthUser> {
    if (!request.auth?.uid) {
      throw new Error('Authentication required (fallback mode)');
    }

    return {
      uid: request.auth.uid,
      email: request.auth.token?.email || 'unknown@fallback.com',
      name: request.auth.token?.name || 'Unknown User',
      picture: request.auth.token?.picture
    };
  }

  async requireAuthentication(request: AuthRequest): Promise<AuthUser> {
    return this.authenticateUser(request);
  }
}

/**
 * Fallback premium guard for when premium submodule is not available
 */
export class FallbackPremiumGuard implements PremiumGuard {
  async requirePremiumAccess(request: AuthRequest, featureId: string): Promise<AuthUser> {
    // Fallback - deny premium access but allow basic auth
    const user = await AuthIntegration.getAuthGuardWithFallback().authenticateUser(request);

    console.warn(`Premium feature ${featureId} accessed in fallback mode - denying access`);
    throw new Error(`Premium feature ${featureId} requires subscription (fallback mode)`);
  }

  async checkPremiumFeature(userId: string, featureId: string): Promise<boolean> {
    // Fallback - always deny premium features
    console.warn(`Premium feature check for ${featureId} in fallback mode - denying access`);
    return false;
  }
}

// Export singleton instances for compatibility
export const AutonomousAuthService = AuthIntegration.getAutonomousAuthServiceWithFallback();
export const authenticateUser = async (request: AuthRequest): Promise<AuthUser> => {
  const authGuard = AuthIntegration.getAuthGuardWithFallback();
  return authGuard.authenticateUser(request);
};
export const requirePremiumAccess = async (request: AuthRequest, featureId: string): Promise<AuthUser> => {
  const premiumGuard = AuthIntegration.getPremiumGuardWithFallback();
  return premiumGuard.requirePremiumAccess(request, featureId);
};