// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Update CV Data Function
 * 
 * Handles updates to CV data including profile pictures and personal information.
 * Provides secure, validated updates with proper error handling.
 */

import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { corsOptions } from '../config/cors';
import { UpdateCVDataRequest, UpdateCVDataResponse } from '../../types';

export const updateCVData = onCall(
  {
    timeoutSeconds: 60,
    memory: '512MiB',
    ...corsOptions
  },
  async (request: CallableRequest<UpdateCVDataRequest>) => {
    try {
      const { jobId, updateData, updateType } = request.data;
      const uid = request.auth?.uid;

      // Validate authentication
      if (!uid) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
      }

      // Validate required parameters
      if (!jobId || typeof jobId !== 'string') {
        throw new HttpsError('invalid-argument', 'Valid jobId is required');
      }

      if (!updateData || typeof updateData !== 'object') {
        throw new HttpsError('invalid-argument', 'Valid updateData is required');
      }

      if (!updateType || typeof updateType !== 'string') {
        throw new HttpsError('invalid-argument', 'Valid updateType is required');
      }

      logger.info('Updating CV data', { 
        jobId, 
        updateType, 
        uid,
        hasProfilePicture: !!updateData.profilePicture,
        hasPersonalInfo: !!updateData.personalInfo
      });

      // Get job document
      const jobRef = admin.firestore().collection('jobs').doc(jobId);
      const jobDoc = await jobRef.get();

      if (!jobDoc.exists) {
        throw new HttpsError('not-found', 'Job not found');
      }

      const jobData = jobDoc.data();
      
      // Verify ownership
      if (jobData?.userId !== uid) {
        throw new HttpsError('permission-denied', 'User does not own this job');
      }

      // Validate update data
      const validationResult = validateUpdateData(updateData, updateType);
      if (!validationResult.isValid) {
        throw new HttpsError('invalid-argument', validationResult.errors.join('; '));
      }

      // Prepare update object
      const updateObject: any = {
        updatedAt: FieldValue.serverTimestamp(),
        lastModifiedBy: uid,
        lastModificationType: updateType
      };

      // Handle profile picture updates
      if (updateData.profilePicture) {
        updateObject['profilePicture'] = updateData.profilePicture;
        
        // Update avatar in parsed data
        updateObject['parsedData.personalInfo.avatar'] = updateData.profilePicture.url;
        
        logger.info('Updating profile picture', {
          jobId,
          imageUrl: updateData.profilePicture.url,
          imagePath: updateData.profilePicture.path
        });
      }

      // Handle personal info updates
      if (updateData.personalInfo) {
        // Update each field in parsed data
        Object.entries(updateData.personalInfo).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            updateObject[`parsedData.personalInfo.${key}`] = value;
          }
        });
        
        logger.info('Updating personal info', {
          jobId,
          fields: Object.keys(updateData.personalInfo)
        });
      }

      // Handle other update types
      if (updateType !== 'profilePicture' && updateType !== 'personalInfo') {
        Object.entries(updateData).forEach(([key, value]) => {
          if (key !== 'profilePicture' && key !== 'personalInfo' && value !== undefined) {
            updateObject[`parsedData.${key}`] = value;
          }
        });
      }

      // Perform the update
      await jobRef.update(updateObject);

      logger.info('CV data updated successfully', { 
        jobId, 
        updateType,
        uid,
        updatedFields: Object.keys(updateObject)
      });

      // Get updated document for response
      const updatedDoc = await jobRef.get();
      const updatedData = updatedDoc.data();

      return {
        success: true,
        message: `CV data updated successfully (${updateType})`,
        updatedData: {
          profilePicture: updatedData?.profilePicture,
          personalInfo: updatedData?.parsedData?.personalInfo
        }
      };

    } catch (error) {
      logger.error('CV data update failed', {
        jobId: request.data?.jobId,
        updateType: request.data?.updateType,
        uid: request.auth?.uid,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to update CV data');
    }
  }
);

/**
 * Validate update data based on type
 */
function validateUpdateData(updateData: any, updateType: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate profile picture data
  if (updateData.profilePicture) {
    const { url, path, uploadedAt } = updateData.profilePicture;
    
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      errors.push('Invalid profile picture URL');
    }
    
    if (!path || typeof path !== 'string') {
      errors.push('Profile picture path is required');
    }
    
    if (!uploadedAt || typeof uploadedAt !== 'string') {
      errors.push('Profile picture upload timestamp is required');
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      errors.push('Profile picture URL is not valid');
    }
  }

  // Validate personal info
  if (updateData.personalInfo) {
    const personalInfo = updateData.personalInfo;
    
    // Validate email format if provided
    if (personalInfo.email && typeof personalInfo.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalInfo.email)) {
        errors.push('Invalid email format');
      }
    }
    
    // Validate URL formats if provided
    const urlFields = ['website', 'linkedin', 'github', 'avatar'];
    urlFields.forEach(field => {
      if (personalInfo[field] && typeof personalInfo[field] === 'string') {
        try {
          new URL(personalInfo[field]);
        } catch {
          errors.push(`Invalid ${field} URL format`);
        }
      }
    });
    
    // Validate string fields
    const stringFields = ['name', 'title', 'phone', 'location', 'summary'];
    stringFields.forEach(field => {
      if (personalInfo[field] && typeof personalInfo[field] !== 'string') {
        errors.push(`${field} must be a string`);
      }
    });
    
    // Validate numeric fields
    if (personalInfo.yearsExperience !== undefined) {
      if (typeof personalInfo.yearsExperience !== 'number' || personalInfo.yearsExperience < 0) {
        errors.push('Years of experience must be a non-negative number');
      }
    }
  }

  // Type-specific validation
  if (updateType === 'profilePicture' && !updateData.profilePicture) {
    errors.push('Profile picture data is required for profilePicture update type');
  }

  if (updateType === 'personalInfo' && !updateData.personalInfo) {
    errors.push('Personal info data is required for personalInfo update type');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Type definitions for this function
 */
export type { UpdateCVDataRequest, UpdateCVDataResponse };

export default updateCVData;