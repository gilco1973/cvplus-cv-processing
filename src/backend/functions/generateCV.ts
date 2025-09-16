// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Generate CV Function
 * 
 * Simplified function wrapper that uses the new modular CV services.
 * Maintains backward compatibility with existing API.
 * 
 * @author Gil Klainert
 * @version 2.0.0 - Modularized
 */

import { onCall } from 'firebase-functions/v2/https';
import { corsOptions } from '../config/cors';
import { CVGenerationService } from '../services/cv-generation.service';
import { EnhancementProcessingService } from '../services/enhancement-processing.service';
import { ServiceRegistry } from '../../shared/utils/service-registry';
// import { CVProcessingContext } from '../../types/service-types'; // Module not found - using placeholder

// Temporary placeholder types
type CVProcessingContext = {
  userId: string;
  jobId: string;
  cvData: any; // Added to match usage
  features?: string[];
  templateId?: string;
  metadata?: {
    startTime: Date;
    version: string;
    [key: string]: any;
  };
};
import { handleSpecialFeatures, handleGenerationError } from '../../shared/utils/cv-generation-helpers';
import * as admin from 'firebase-admin';
import { CVGenerationRequest, CVGenerationResponse } from '../../types';

// Initialize service registry
const registry = ServiceRegistry.getInstance();

/**
 * Core CV generation logic that can be called from other functions
 * Maintains backward compatibility while using new service architecture
 */
export async function generateCVCore(
  jobId: string, 
  templateId: string | undefined, 
  features: string[] | undefined, 
  userId: string
) {
  try {
    console.log(`🚀 Starting CV generation with modular services for job ${jobId}`);

    // Initialize services if not already done
    await initializeServices();

    // Get CV generation service
    const cvGenerationService = registry.requireService<CVGenerationService>('cv-generation');
    const enhancementService = registry.requireService<EnhancementProcessingService>('enhancement-processing');

    // Get job data for CV processing context
    const jobDoc = await admin.firestore().collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      throw new Error('Job not found');
    }

    const jobData = jobDoc.data()!;
    const cvData = features?.includes('privacy-mode') && jobData.privacyVersion 
      ? jobData.privacyVersion 
      : jobData.parsedData;

    // Create processing context
    const context: CVProcessingContext = {
      jobId,
      userId,
      cvData,
      templateId,
      features,
      metadata: {
        startTime: new Date(),
        version: '2.0.0'
      }
    };

    // Step 1: Generate CV using CV Generation Service
    console.log(`📄 Generating CV with template: ${templateId || 'modern'}`);
    const cvResult = await cvGenerationService.generateCV(context);
    
    if (!cvResult.success) {
      throw new Error(`CV generation failed: ${cvResult.error?.message}`);
    }

    // Step 2: Process enhancement features using Enhancement Service
    if (features && features.length > 0) {
      console.log(`✨ Processing ${features.length} enhancement features`);
      const enhancementResult = await enhancementService.processFeatures(context);
      
      if (!enhancementResult.success) {
        console.warn(`⚠️ Enhancement processing had issues: ${enhancementResult.error?.message}`);
      }
    }

    // Step 3: Handle special features (like podcast generation)
    await handleSpecialFeatures(jobId, features);

    console.log(`✅ CV generation completed successfully for job ${jobId}`);

    return {
      success: true,
      generatedCV: cvResult.data
    };

  } catch (error: any) {
    console.error(`❌ CV generation failed for job ${jobId}:`, error);
    
    // Update job with error status
    await handleGenerationError(jobId, error);
    
    throw new Error(`Failed to generate CV: ${error.message}`);
  }
}

/**
 * Firebase Function export - maintains exact same API
 */
export const generateCV = onCall(
  {
    timeoutSeconds: 600, // 10 minutes
    memory: '2GiB',
    ...corsOptions
  },
  async (request) => {
    if (!request.auth) {
      throw new Error('User must be authenticated');
    }

    const { jobId, templateId, features } = request.data;
    const userId = request.auth.uid;
    
    return await generateCVCore(jobId, templateId, features, userId);
  }
);

/**
 * Initialize services in the registry
 */
async function initializeServices(): Promise<void> {
  try {
    // Register CV Generation Service
    if (!registry.hasService('cv-generation')) {
      const cvService = new CVGenerationService();
      await registry.registerService(cvService);
    }

    // Register Enhancement Processing Service
    if (!registry.hasService('enhancement-processing')) {
      const enhancementService = new EnhancementProcessingService();
      await registry.registerService(enhancementService);
    }

    console.log('📋 Services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Type definitions for this function
 */
export type { CVGenerationRequest, CVGenerationResponse };