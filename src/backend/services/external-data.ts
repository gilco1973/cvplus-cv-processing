// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * External Data Service for CV Processing
 *
 * This file is now a simple re-export of the integrated external-data functionality.
 * The main implementation has been moved to src/external-data/
 */

// Re-export the integrated external-data functionality
export {
  ExternalDataOrchestrator,
  type OrchestrationRequest,
  type OrchestrationResult
} from '../external-data';

// For backward compatibility, create a singleton instance
export const externalDataOrchestrator = new ExternalDataOrchestrator();