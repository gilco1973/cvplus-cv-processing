/**
 * Enhancement Processing Service - Backward Compatibility Facade
 *
 * This facade provides backward compatibility for the enhancement processing service
 * that has been migrated to the enhancements module.
 *
 * @author Gil Klainert
 * @version 2.1.0 - Migration Facade
 * @deprecated Use @cvplus/enhancements/backend instead
 */

// Re-export from enhancements module
export {
  EnhancementProcessingService,
  type EnhancementResult,
  type EnhancementOptions,
  type EnhancementFeature
} from '@cvplus/enhancements/backend';

// Backward compatibility types
export interface LegacyEnhancementOptions {
  type?: string;
  level?: 'basic' | 'advanced';
}

export interface LegacyEnhancementResult {
  success: boolean;
  enhancements?: any;
  error?: string;
}

/**
 * Legacy enhancement processing function for backward compatibility
 * @deprecated Use EnhancementProcessingService from @cvplus/enhancements instead
 */
export const processEnhancements = async (options: LegacyEnhancementOptions = {}) => {
  console.warn('processEnhancements is deprecated. Use EnhancementProcessingService from @cvplus/enhancements instead.');
  return {
    success: false,
    error: 'Legacy function deprecated. Use @cvplus/enhancements/backend instead.'
  };
};
