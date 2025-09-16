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

// Note: The actual implementation has been moved to @cvplus/enhancements
// This file exists only for backward compatibility during the migration period.
// New code should import directly from @cvplus/enhancements/backend