// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Cloud Functions for Skills Visualization
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { skillsVisualizationService } from '../services/skills-visualization.service';
import { EnhancedJob, ParsedCV } from '../../types/enhanced-models';
import { corsOptions } from '../config/cors';
import { SkillsVisualizationRequest, SkillsVisualizationResponse } from '../../types';

interface GenerateVisualizationRequest {
  jobId: string;
  settings?: {
    chartTypes?: Array<'radar' | 'bar' | 'bubble' | 'treemap'>;
    includeProgress?: boolean;
    includeEndorsements?: boolean;
  };
}

interface UpdateSkillsRequest {
  jobId: string;
  skills: Array<{
    name: string;
    level: number;
    category: string;
    yearsOfExperience?: number;
    lastUsed?: Date;
  }>;
}

interface GetInsightsRequest {
  jobId: string;
  targetRole?: string;
}

interface ExportDataRequest {
  jobId: string;
  format: 'json' | 'csv' | 'pdf';
}

interface EndorseSkillRequest {
  jobId: string;
  skillName: string;
  endorserId: string;
  comment?: string;
}

/**
 * Generate skills visualization
 */
export const generateSkillsVisualization = onCall<GenerateVisualizationRequest>(
  {
    timeoutSeconds: 120,
    ...corsOptions
  },
  async (request: CallableRequest<GenerateVisualizationRequest>) => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { jobId, settings } = request.data;
    if (!jobId) {
      throw new HttpsError('invalid-argument', 'Job ID is required');
    }

    try {
      // Get job and verify ownership
      const jobDoc = await admin.firestore().collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) {
        throw new HttpsError('not-found', 'Job not found');
      }

      const job = jobDoc.data() as EnhancedJob;
      if (job.userId !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'Unauthorized access to job');
      }

      // Update status to processing
      await jobDoc.ref.update({
        'enhancedFeatures.skillsVisualization': {
          status: 'processing',
          progress: 25,
          currentStep: 'Analyzing skills and expertise...',
          startedAt: new Date()
        }
      });

      // Generate skills visualization
      const visualization = await skillsVisualizationService.generateVisualization(
        job.parsedData!,
        settings?.chartTypes || ['radar', 'bar'],
        {
          includeProgress: settings?.includeProgress !== false,
          includeEndorsements: settings?.includeEndorsements || false
        }
      );

      // Update progress
      await jobDoc.ref.update({
        'enhancedFeatures.skillsVisualization.progress': 75,
        'enhancedFeatures.skillsVisualization.currentStep': 'Generating interactive visualization...'
      });

      // Update job with visualization data
      await jobDoc.ref.update({
        'enhancedFeatures.skillsVisualization': {
          enabled: true,
          data: visualization,
          status: 'completed',
          progress: 100,
          processedAt: new Date()
        }
      });

      return {
        success: true,
        visualization,
        htmlFragment: null
      };
    } catch (error: any) {
      
      // Update job with error status
      await admin.firestore().collection('jobs').doc(jobId).update({
        'enhancedFeatures.skillsVisualization.status': 'failed',
        'enhancedFeatures.skillsVisualization.error': error.message,
        'enhancedFeatures.skillsVisualization.processedAt': new Date()
      });
      
      throw new HttpsError('internal', 'Failed to generate skills visualization');
    }
  }
);

/**
 * Update skills data
 */
export const updateSkillsData = onCall<UpdateSkillsRequest>(
  {
    timeoutSeconds: 90,
    ...corsOptions
  },
  async (request: CallableRequest<UpdateSkillsRequest>) => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { jobId, skills } = request.data;
    if (!jobId || !skills) {
      throw new HttpsError('invalid-argument', 'Job ID and skills are required');
    }

    try {
      // Get job and verify ownership
      const jobDoc = await admin.firestore().collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) {
        throw new HttpsError('not-found', 'Job not found');
      }

      const job = jobDoc.data() as EnhancedJob;
      if (job.userId !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'Unauthorized access to job');
      }

      // Update skills in parsed CV
      const updatedCV = {
        ...job.parsedData!,
        skills: {
          technical: skills.filter(s => s.category === 'technical'),
          soft: skills.filter(s => s.category === 'soft'),
          tools: skills.filter(s => s.category === 'tools'),
          languages: skills.filter(s => s.category === 'languages')
        }
      };

      // Regenerate visualization with updated skills
      const visualization = await skillsVisualizationService.generateVisualization(
        updatedCV as unknown as ParsedCV,
        ['radar', 'bar']
      );

      // Update job
      await jobDoc.ref.update({
        'parsedData.skills': updatedCV.skills,
        'enhancedFeatures.skillsVisualization.data': visualization,
        'enhancedFeatures.skillsVisualization.updatedAt': new Date()
      });

      return {
        success: true,
        skills: updatedCV.skills,
        visualization
      };
    } catch (error) {
      throw new HttpsError('internal', 'Failed to update skills data');
    }
  }
);

/**
 * Get skills insights
 */
export const getSkillsInsights = onCall<GetInsightsRequest>(
  {
    timeoutSeconds: 90,
    ...corsOptions
  },
  async (request: CallableRequest<GetInsightsRequest>) => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { jobId, targetRole } = request.data;
    if (!jobId) {
      throw new HttpsError('invalid-argument', 'Job ID is required');
    }

    try {
      // Get job and verify ownership
      const jobDoc = await admin.firestore().collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) {
        throw new HttpsError('not-found', 'Job not found');
      }

      const job = jobDoc.data() as EnhancedJob;
      if (job.userId !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'Unauthorized access to job');
      }

      // Generate insights
      const insights = await skillsVisualizationService.analyzeSkills(
        job.parsedData!,
        targetRole
      );

      return {
        success: true,
        insights
      };
    } catch (error) {
      throw new HttpsError('internal', 'Failed to get skills insights');
    }
  }
);

/**
 * Export skills data
 */
export const exportSkillsData = onCall<ExportDataRequest>(
  {
    timeoutSeconds: 60,
    ...corsOptions
  },
  async (request: CallableRequest<ExportDataRequest>) => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { jobId, format } = request.data;
    if (!jobId || !format) {
      throw new HttpsError('invalid-argument', 'Job ID and format are required');
    }

    try {
      // Get job and verify ownership
      const jobDoc = await admin.firestore().collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) {
        throw new HttpsError('not-found', 'Job not found');
      }

      const job = jobDoc.data() as EnhancedJob;
      if (job.userId !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'Unauthorized access to job');
      }

      const visualization = job.enhancedFeatures?.skillsVisualization?.data;
      if (!visualization) {
        throw new HttpsError('not-found', 'Skills visualization not found');
      }

      // Export data in requested format
      let exportData;
      if (format === 'json') {
        exportData = JSON.stringify(visualization, null, 2);
      } else if (format === 'csv') {
        exportData = skillsVisualizationService.exportToCSV(visualization);
      } else if (format === 'pdf') {
        // For PDF, return a URL to generate on the frontend
        exportData = {
          type: 'pdf',
          data: visualization,
          generateUrl: `/api/generate-pdf/${jobId}/skills`
        };
      }

      return {
        success: true,
        format,
        data: exportData
      };
    } catch (error) {
      throw new HttpsError('internal', 'Failed to export skills data');
    }
  }
);

/**
 * Endorse a skill
 */
export const endorseSkill = onCall<EndorseSkillRequest>(
  {
    timeoutSeconds: 60,
    ...corsOptions
  },
  async (request: CallableRequest<EndorseSkillRequest>) => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { jobId, skillName, endorserId, comment } = request.data;
    if (!jobId || !skillName || !endorserId) {
      throw new HttpsError('invalid-argument', 'Job ID, skill name, and endorser ID are required');
    }

    try {
      // Get job
      const jobDoc = await admin.firestore().collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) {
        throw new HttpsError('not-found', 'Job not found');
      }

      const job = jobDoc.data() as EnhancedJob;

      // Create endorsement
      const endorsement = {
        skillName,
        endorserId,
        endorserName: request.auth.token?.name || 'Anonymous',
        comment,
        createdAt: new Date()
      };

      // Add endorsement to job
      await jobDoc.ref.update({
        'endorsements': admin.firestore.FieldValue.arrayUnion(endorsement)
      });

      // Update skills visualization if it exists
      if (job.enhancedFeatures?.skillsVisualization?.data) {
        const updatedVisualization = await skillsVisualizationService.addEndorsement(
          job.enhancedFeatures.skillsVisualization.data,
          skillName,
          endorsement
        );

        await jobDoc.ref.update({
          'enhancedFeatures.skillsVisualization.data': updatedVisualization
        });
      }

      return {
        success: true,
        endorsement
      };
    } catch (error) {
      throw new HttpsError('internal', 'Failed to endorse skill');
    }
  }
);

/**
 * Type definitions for this function
 */
export type { SkillsVisualizationRequest, SkillsVisualizationResponse };