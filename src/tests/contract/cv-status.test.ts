// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Contract Test: GET /cv/status/{jobId}
 *
 * This test validates the API contract for CV processing status endpoint.
 * It MUST FAIL initially (TDD Red phase) before implementation.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Import local constants and types
import { PROCESSING_CONFIG, ERROR_MESSAGES } from '../../shared/constants';
import { CVStatus, ProcessingType } from '../../shared/types';
import { JobStatus } from '../../types/processing.types';
import { createMockProcessingResponse } from '../../__tests__/setup';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/getmycv-ai/us-central1';

describe('Contract: GET /cv/status/{jobId}', () => {
  let authToken: string;

  beforeAll(async () => {
    // Mock authentication token for testing
    authToken = 'test-bearer-token';
  });

  afterAll(async () => {
    // Cleanup any test data if needed
  });

  describe('Success Cases', () => {
    it('should return 200 with valid job status for processing job', async () => {
      // Arrange
      const mockJobId = uuidv4();

      // Act
      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Assert - Contract validation
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('jobId');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('progress');
      expect(response.data).toHaveProperty('features');
      expect(response.data).toHaveProperty('createdAt');
      expect(response.data).toHaveProperty('updatedAt');

      // Data type validations
      expect(typeof response.data.jobId).toBe('string');
      expect(typeof response.data.status).toBe('string');
      expect(typeof response.data.userId).toBe('string');
      expect(typeof response.data.progress).toBe('number');
      expect(Array.isArray(response.data.features)).toBe(true);
      expect(typeof response.data.createdAt).toBe('string');
      expect(typeof response.data.updatedAt).toBe('string');

      // Value validations
      expect(response.data.jobId).toBe(mockJobId);
      expect(Object.values(JobStatus)).toContain(response.data.status);
      expect(response.data.progress).toBeGreaterThanOrEqual(0);
      expect(response.data.progress).toBeLessThanOrEqual(100);
    });

    it('should return correct structure for queued job', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      if (response.data.status === JobStatus.QUEUED) {
        expect(response.data.progress).toBe(0);
        expect(response.data).toHaveProperty('estimatedStartTime');
        expect(typeof response.data.estimatedStartTime).toBe('string');
      }
    });

    it('should return progress details for processing job', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      if (response.data.status === JobStatus.RUNNING) {
        expect(response.data.progress).toBeGreaterThan(0);
        expect(response.data.progress).toBeLessThan(100);
        expect(response.data).toHaveProperty('currentStep');
        expect(response.data).toHaveProperty('estimatedCompletionTime');
        expect(typeof response.data.currentStep).toBe('string');
        expect(typeof response.data.estimatedCompletionTime).toBe('string');
      }
    });

    it('should return completion details for completed job', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      if (response.data.status === JobStatus.COMPLETED) {
        expect(response.data.progress).toBe(100);
        expect(response.data).toHaveProperty('completedAt');
        expect(response.data).toHaveProperty('results');
        expect(typeof response.data.completedAt).toBe('string');
        expect(typeof response.data.results).toBe('object');

        // Results structure validation
        expect(response.data.results).toHaveProperty('enhancedCV');
        expect(response.data.results).toHaveProperty('atsScore');
        if (response.data.features.includes('personality_insights')) {
          expect(response.data.results).toHaveProperty('personalityInsights');
        }
        if (response.data.features.includes('ai_podcast')) {
          expect(response.data.results).toHaveProperty('podcastUrl');
        }
        if (response.data.features.includes('video_introduction')) {
          expect(response.data.results).toHaveProperty('videoUrl');
        }
      }
    });

    it('should return error details for failed job', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      if (response.data.status === 'failed') {
        expect(response.data).toHaveProperty('error');
        expect(response.data).toHaveProperty('failedAt');
        expect(typeof response.data.error).toBe('object');
        expect(typeof response.data.failedAt).toBe('string');

        // Error structure validation
        expect(response.data.error).toHaveProperty('code');
        expect(response.data.error).toHaveProperty('message');
        expect(typeof response.data.error.code).toBe('string');
        expect(typeof response.data.error.message).toBe('string');
      }
    });
  });

  describe('Error Cases', () => {
    it('should return 404 for non-existent job ID', async () => {
      const nonExistentJobId = uuidv4();

      try {
        await axios.get(`${API_BASE_URL}/cv/status/${nonExistentJobId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('error');
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.error).toBe('JOB_NOT_FOUND');
        expect(error.response.data.message).toContain(nonExistentJobId);
      }
    });

    it('should return 401 for missing authorization', async () => {
      const mockJobId = uuidv4();

      try {
        await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
          headers: {
            'Content-Type': 'application/json'
            // No Authorization header
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('UNAUTHORIZED');
      }
    });

    it('should return 401 for invalid authorization token', async () => {
      const mockJobId = uuidv4();

      try {
        await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('INVALID_TOKEN');
      }
    });

    it('should return 400 for malformed job ID', async () => {
      const malformedJobId = 'not-a-valid-uuid';

      try {
        await axios.get(`${API_BASE_URL}/cv/status/${malformedJobId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('INVALID_JOB_ID_FORMAT');
      }
    });

    it('should return 403 when accessing another users job', async () => {
      // This job ID belongs to a different user
      const otherUserJobId = uuidv4();

      try {
        await axios.get(`${API_BASE_URL}/cv/status/${otherUserJobId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.error).toBe('ACCESS_DENIED');
        expect(error.response.data.message).toContain('permission');
      }
    });
  });

  describe('Status-Specific Validations', () => {
    it('should include queue position for queued jobs', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.status === JobStatus.QUEUED) {
        expect(response.data).toHaveProperty('queuePosition');
        expect(typeof response.data.queuePosition).toBe('number');
        expect(response.data.queuePosition).toBeGreaterThanOrEqual(1);
      }
    });

    it('should include processing steps for processing jobs', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.status === JobStatus.RUNNING) {
        expect(response.data).toHaveProperty('steps');
        expect(Array.isArray(response.data.steps)).toBe(true);

        if (response.data.steps.length > 0) {
          const firstStep = response.data.steps[0];
          expect(firstStep).toHaveProperty('name');
          expect(firstStep).toHaveProperty('status');
          expect(firstStep).toHaveProperty('progress');
          expect(['pending', 'in_progress', 'completed', 'failed']).toContain(firstStep.status);
        }
      }
    });

    it('should include retry count for failed jobs', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.status === 'failed') {
        expect(response.data).toHaveProperty('retryCount');
        expect(response.data).toHaveProperty('canRetry');
        expect(typeof response.data.retryCount).toBe('number');
        expect(typeof response.data.canRetry).toBe('boolean');
        expect(response.data.retryCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Feature-Specific Results', () => {
    it('should include ATS optimization results when feature is enabled', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.status === 'completed' &&
          response.data.features.includes('ats_optimization')) {
        expect(response.data.results).toHaveProperty('atsOptimization');
        expect(response.data.results.atsOptimization).toHaveProperty('score');
        expect(response.data.results.atsOptimization).toHaveProperty('improvements');
        expect(typeof response.data.results.atsOptimization.score).toBe('number');
        expect(Array.isArray(response.data.results.atsOptimization.improvements)).toBe(true);
      }
    });

    it('should include multimedia URLs when multimedia features are enabled', async () => {
      const mockJobId = uuidv4();

      const response = await axios.get(`${API_BASE_URL}/cv/status/${mockJobId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.status === JobStatus.COMPLETED) {
        if (response.data.features.includes('ai_podcast')) {
          expect(response.data.results).toHaveProperty('podcastUrl');
          expect(typeof response.data.results.podcastUrl).toBe('string');
        }

        if (response.data.features.includes('video_introduction')) {
          expect(response.data.results).toHaveProperty('videoUrl');
          expect(typeof response.data.results.videoUrl).toBe('string');
        }

        if (response.data.features.includes('interactive_timeline')) {
          expect(response.data.results).toHaveProperty('timelineUrl');
          expect(typeof response.data.results.timelineUrl).toBe('string');
        }
      }
    });
  });
});