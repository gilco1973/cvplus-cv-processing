// @ts-ignore
/**
 * CV Upload Firebase Function
 *
 * Handles CV file uploads and initiates processing jobs.
 * Implements the POST /cv/upload contract from api-spec.yaml.
 *
 * @fileoverview Core CV upload functionality with comprehensive validation
  */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Busboy from 'busboy';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

// Import shared types
import { CVJob, createCVJob, InputType, FeatureType, ProcessingStatus, isFeatureType, calculateTotalCreditCost } from '../../../../../shared/types/cv-job';
import { UserProfile, hasSufficientCredits, hasFeatureAccess, getSubscriptionLimits } from '../../../../../shared/types/user';

// Import core utilities
import { validateFileType, validateFileSize, sanitizeFileName } from '@cvplus/core/utils';
import { AuthService } from '@cvplus/auth';

// Initialize Firebase services
const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();

/**
 * Upload CV file and create processing job
 *
 * POST /cv/upload
 * Content-Type: multipart/form-data
 *
 * Request:
 * - file: Binary file (PDF, DOCX, TXT, CSV) - max 10MB
 * - features: JSON array of selected features
 * - customizations: JSON object of feature customizations
 *
 * Response:
 * - 201: Job created successfully
 * - 400: Invalid request (missing file, invalid format, etc.)
 * - 401: Unauthorized
 * - 413: File too large
 * - 429: Rate limited
  */
export const uploadCV = functions
  .runWith({
    memory: '512MB',
    timeoutSeconds: 60,
    maxInstances: 20
  })
  .https
  .onRequest(async (request, response) => {
    try {
      // CORS headers
      response.set('Access-Control-Allow-Origin', '*');
      response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
      }

      // Only allow POST requests
      if (request.method !== 'POST') {
        response.status(405).json({
          error: 'METHOD_NOT_ALLOWED',
          message: 'Only POST requests are allowed'
        });
        return;
      }

      // Authenticate user
      const authResult = await AuthService.authenticateRequest(request);
      if (!authResult.success) {
        response.status(401).json({
          error: 'UNAUTHORIZED',
          message: authResult.error || 'Authentication required'
        });
        return;
      }

      const userId = authResult.userId!;

      // Get user profile
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        response.status(401).json({
          error: 'USER_NOT_FOUND',
          message: 'User profile not found'
        });
        return;
      }

      const userProfile = userDoc.data() as UserProfile;
      const subscriptionLimits = getSubscriptionLimits(userProfile.subscription);

      // Parse multipart form data
      const formData = await parseMultipartForm(request, subscriptionLimits.maxFileSize);

      // Validate required fields
      if (!formData.file) {
        response.status(400).json({
          error: 'MISSING_REQUIRED_FIELD',
          message: 'File is required'
        });
        return;
      }

      // Validate file type
      const inputType = getInputTypeFromMimeType(formData.file.mimeType);
      if (!inputType) {
        response.status(400).json({
          error: 'UNSUPPORTED_FILE_FORMAT',
          message: 'Supported formats: PDF, DOCX, TXT, CSV',
          supportedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv']
        });
        return;
      }

      // Validate file size
      if (formData.file.size > subscriptionLimits.maxFileSize) {
        response.status(413).json({
          error: 'PAYLOAD_TOO_LARGE',
          message: `File size ${formData.file.size} exceeds maximum ${subscriptionLimits.maxFileSize} bytes`
        });
        return;
      }

      // Parse and validate features
      let selectedFeatures: FeatureType[] = [];
      if (formData.features) {
        try {
          const featuresArray = JSON.parse(formData.features);
          if (!Array.isArray(featuresArray)) {
            throw new Error('Features must be an array');
          }

          // Validate each feature
          for (const feature of featuresArray) {
            if (!isFeatureType(feature)) {
              response.status(400).json({
                error: 'INVALID_FEATURE_SELECTION',
                message: `Invalid feature: ${feature}`,
                validFeatures: Object.values(FeatureType)
              });
              return;
            }

            // Check feature access based on subscription
            if (!hasFeatureAccess(userProfile, feature)) {
              response.status(400).json({
                error: 'FEATURE_ACCESS_DENIED',
                message: `Feature ${feature} not available for ${userProfile.subscription} subscription`,
                availableFeatures: subscriptionLimits.availableFeatures
              });
              return;
            }

            selectedFeatures.push(feature as FeatureType);
          }
        } catch (error) {
          response.status(400).json({
            error: 'INVALID_FEATURE_FORMAT',
            message: 'Features must be a valid JSON array'
          });
          return;
        }
      } else {
        // Default to ATS optimization if no features specified
        selectedFeatures = [FeatureType.ATS_OPTIMIZATION];
      }

      // Check if user has sufficient credits
      const creditCost = calculateTotalCreditCost(selectedFeatures);
      if (!hasSufficientCredits(userProfile, creditCost)) {
        response.status(400).json({
          error: 'INSUFFICIENT_CREDITS',
          message: `Processing requires ${creditCost} credits, but you have ${userProfile.credits}`,
          requiredCredits: creditCost,
          availableCredits: userProfile.credits
        });
        return;
      }

      // Parse customizations
      let customizations: Record<string, any> = {};
      if (formData.customizations) {
        try {
          customizations = JSON.parse(formData.customizations);
          if (typeof customizations !== 'object' || customizations === null) {
            throw new Error('Customizations must be an object');
          }
        } catch (error) {
          response.status(400).json({
            error: 'INVALID_CUSTOMIZATIONS_FORMAT',
            message: 'Customizations must be a valid JSON object'
          });
          return;
        }
      }

      // Upload file to Firebase Storage
      const jobId = uuidv4();
      const sanitizedFileName = sanitizeFileName(formData.file.filename);
      const storageFileName = `cv-uploads/${userId}/${jobId}/${sanitizedFileName}`;

      const file = bucket.file(storageFileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: formData.file.mimeType,
          metadata: {
            uploadedBy: userId,
            jobId: jobId,
            originalFileName: formData.file.filename,
            fileSize: formData.file.size.toString()
          }
        }
      });

      // Handle upload errors
      stream.on('error', (error) => {
        functions.logger.error('File upload failed:', error);
        if (!response.headersSent) {
          response.status(500).json({
            error: 'UPLOAD_FAILED',
            message: 'Failed to upload file'
          });
        }
      });

      // Handle upload completion
      stream.on('finish', async () => {
        try {
          // Get the uploaded file URL
          const [fileUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // Far future date
          });

          // Create CV job in Firestore
          const cvJob = createCVJob(
            jobId,
            userId,
            formData.file.filename,
            fileUrl,
            formData.file.size,
            inputType,
            selectedFeatures
          );

          // Add customizations
          cvJob.customizations = customizations;

          // Save job to database
          await db.collection('cv-jobs').doc(jobId).set({
            ...cvJob,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Deduct credits from user
          await db.collection('users').doc(userId).update({
            credits: admin.firestore.FieldValue.increment(-creditCost),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Trigger processing (async)
          triggerCVProcessing(jobId, cvJob);

          // Calculate estimated completion time
          const estimatedCompletionTime = new Date();
          estimatedCompletionTime.setMinutes(estimatedCompletionTime.getMinutes() + 2); // 2 minutes estimate

          // Return success response
          response.status(201).json({
            jobId: jobId,
            status: ProcessingStatus.PENDING,
            userId: userId,
            features: selectedFeatures,
            creditsUsed: creditCost,
            remainingCredits: userProfile.credits - creditCost,
            createdAt: new Date().toISOString(),
            estimatedCompletionTime: estimatedCompletionTime.toISOString()
          });

        } catch (error) {
          functions.logger.error('Failed to create CV job:', error);
          response.status(500).json({
            error: 'JOB_CREATION_FAILED',
            message: 'Failed to create processing job'
          });
        }
      });

      // Write file data to stream
      stream.end(formData.file.buffer);

    } catch (error) {
      functions.logger.error('CV upload error:', error);
      if (!response.headersSent) {
        response.status(500).json({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        });
      }
    }
  });

// ============================================================================
// Helper Functions
// ============================================================================

interface ParsedFile {
  filename: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

interface FormData {
  file?: ParsedFile;
  features?: string;
  customizations?: string;
}

/**
 * Parse multipart form data from request
  */
async function parseMultipartForm(request: functions.Request, maxFileSize: number): Promise<FormData> {
  return new Promise((resolve, reject) => {
    const formData: FormData = {};
    const busboy = Busboy({
      headers: request.headers,
      limits: {
        fileSize: maxFileSize,
        files: 1,
        fields: 10
      }
    });

    // Handle file uploads
    busboy.on('file', (fieldname, file, info) => {
      if (fieldname !== 'file') {
        file.resume();
        return;
      }

      const { filename, mimeType } = info;
      const chunks: Buffer[] = [];

      file.on('data', (chunk) => {
        chunks.push(chunk);
      });

      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        formData.file = {
          filename,
          mimeType,
          size: buffer.length,
          buffer
        };
      });
    });

    // Handle form fields
    busboy.on('field', (fieldname, value) => {
      if (fieldname === 'features') {
        formData.features = value;
      } else if (fieldname === 'customizations') {
        formData.customizations = value;
      }
    });

    // Handle completion
    busboy.on('finish', () => {
      resolve(formData);
    });

    // Handle errors
    busboy.on('error', (error) => {
      reject(error);
    });

    // Handle file size limit exceeded
    busboy.on('filesLimit', () => {
      reject(new Error('File size limit exceeded'));
    });

    // Pipe request to busboy
    request.pipe(busboy);
  });
}

/**
 * Get InputType from MIME type
  */
function getInputTypeFromMimeType(mimeType: string): InputType | null {
  switch (mimeType) {
    case 'application/pdf':
      return InputType.PDF;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return InputType.DOCX;
    case 'text/plain':
      return InputType.TXT;
    case 'text/csv':
      return InputType.CSV;
    default:
      return null;
  }
}

/**
 * Trigger CV processing asynchronously
  */
async function triggerCVProcessing(jobId: string, job: CVJob) {
  try {
    // Update job status to analyzing
    await db.collection('cv-jobs').doc(jobId).update({
      status: ProcessingStatus.ANALYZING,
      processingStartedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // TODO: Implement actual CV processing logic
    // This would integrate with Claude API, ATS optimization, etc.
    // For now, we'll simulate processing with a delay

    functions.logger.info(`Starting CV processing for job ${jobId}`);

    // In a real implementation, this would:
    // 1. Download and parse the uploaded file
    // 2. Send content to Claude API for analysis
    // 3. Apply selected features (ATS optimization, personality insights, etc.)
    // 4. Generate enhanced CV content
    // 5. Create multimedia content if requested
    // 6. Update job status to completed

  } catch (error) {
    functions.logger.error(`CV processing failed for job ${jobId}:`, error);

    // Update job status to failed
    await db.collection('cv-jobs').doc(jobId).update({
      status: ProcessingStatus.FAILED,
      errorMessage: error instanceof Error ? error.message : 'Processing failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}