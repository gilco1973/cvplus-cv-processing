// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Service Registry
 * 
 * Manages service instances and dependency injection for CV processing services.
 * Provides a centralized way to register, retrieve, and manage service lifecycles.
 * 
 * @author Gil Klainert
 * @version 2.0.0 - Modularized Architecture
 */

// BaseService imported but not used - removing unused import

export interface ServiceInterface {
  getServiceInfo(): {
    name: string;
    version: string;
    uptime: number;
  };
}

export interface ServiceRegistration {
  instance: ServiceInterface;
  registered: Date;
  name: string;
  version: string;
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceRegistration> = new Map();
  private readonly maxServices = 20;

  private constructor() {
    console.log('🏗️ Service Registry initialized');
  }

  /**
   * Get singleton instance of the service registry
   */
  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service instance
   */
  async registerService<T extends ServiceInterface>(
    service: T,
    name?: string
  ): Promise<void> {
    const serviceInfo = service.getServiceInfo();
    const serviceName = name || serviceInfo.name;

    if (this.services.size >= this.maxServices) {
      throw new Error(`Service registry is full (max ${this.maxServices} services)`);
    }

    if (this.services.has(serviceName)) {
      console.warn(`⚠️ Service ${serviceName} is already registered, replacing...`);
    }

    const registration: ServiceRegistration = {
      instance: service,
      registered: new Date(),
      name: serviceName,
      version: serviceInfo.version
    };

    this.services.set(serviceName, registration);
    console.log(`✅ Service registered: ${serviceName} v${serviceInfo.version}`);
  }

  /**
   * Get a service instance
   */
  getService<T extends ServiceInterface>(name: string): T | null {
    const registration = this.services.get(name);
    if (!registration) {
      return null;
    }
    return registration.instance as T;
  }

  /**
   * Get a service instance (throws if not found)
   */
  requireService<T extends ServiceInterface>(name: string): T {
    const service = this.getService<T>(name);
    if (!service) {
      throw new Error(`Required service not found: ${name}. Available services: ${this.listServiceNames().join(', ')}`);
    }
    return service;
  }

  /**
   * Check if a service is registered
   */
  hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Unregister a service
   */
  unregisterService(name: string): boolean {
    const existed = this.services.delete(name);
    if (existed) {
      console.log(`🗑️ Service unregistered: ${name}`);
    }
    return existed;
  }

  /**
   * Get all registered services
   */
  getAllServices(): ServiceRegistration[] {
    return Array.from(this.services.values());
  }

  /**
   * Get service names
   */
  listServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const services = this.getAllServices();
    return {
      totalServices: services.length,
      maxServices: this.maxServices,
      services: services.map(s => ({
        name: s.name,
        version: s.version,
        registered: s.registered,
        uptime: s.instance.getServiceInfo().uptime
      }))
    };
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    console.log(`🧹 Clearing ${this.services.size} services from registry`);
    this.services.clear();
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    services: Array<{
      name: string;
      healthy: boolean;
      error?: string;
    }>;
  }> {
    const results = [];
    let allHealthy = true;

    for (const [name, registration] of this.services.entries()) {
      try {
        // Basic health check - just try to get service info
        const info = registration.instance.getServiceInfo();
        results.push({
          name,
          healthy: true,
          uptime: info.uptime,
          version: info.version
        });
      } catch (error: any) {
        allHealthy = false;
        results.push({
          name,
          healthy: false,
          error: error.message
        });
      }
    }

    return {
      healthy: allHealthy,
      services: results
    };
  }

  /**
   * Get service dependencies (placeholder for future dependency injection)
   */
  getDependencies(serviceName: string): string[] {
    // This could be enhanced to track service dependencies
    // For now, we don't track dependencies for: serviceName
    void serviceName; // Mark as used
    return [];
  }

  /**
   * Validate service registration
   */
  private _validateService(service: ServiceInterface): void {
    if (!service.getServiceInfo) {
      throw new Error('Service must implement getServiceInfo method');
    }

    const info = service.getServiceInfo();
    if (!info.name || !info.version) {
      throw new Error('Service must provide name and version in getServiceInfo');
    }
  }
}