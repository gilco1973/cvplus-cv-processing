// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Contract Test: POST /cv/url
 *
 * This test validates the API contract for CV URL submission endpoint.
 * It MUST FAIL initially (TDD Red phase) before implementation.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

// Import local constants and types
import { PROCESSING_CONFIG, ERROR_MESSAGES } from '../../shared/constants';
import { CVStatus, ProcessingType } from '../../shared/types';
import { JobStatus } from '../../types/processing.types';
import { createMockProcessingRequest, createMockProcessingResponse } from '../../__tests__/setup';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/getmycv-ai/us-central1';

describe('Contract: POST /cv/url', () => {
  let authToken: string;

  beforeAll(async () => {
    // Mock authentication token for testing
    authToken = 'test-bearer-token';
  });

  afterAll(async () => {
    // Cleanup any test data if needed
  });

  describe('Success Cases', () => {
    it('should return 201 with valid CV URL submission', async () => {
      // Arrange
      const requestPayload = {
        url: 'https://example.com/cv.pdf',
        features: ['ats_optimization', 'personality_insights'],
        customizations: {
          ats_optimization: { target_keywords: ['javascript', 'react'] },
          personality_insights: { analysis_depth: 'standard' }
        }
      };

      // Act
      const response = await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Assert - Contract validation
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('jobId');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('sourceUrl');
      expect(response.data).toHaveProperty('features');
      expect(response.data).toHaveProperty('createdAt');
      expect(response.data).toHaveProperty('estimatedCompletionTime');

      // Data type validations
      expect(typeof response.data.jobId).toBe('string');
      expect(typeof response.data.status).toBe('string');
      expect(typeof response.data.userId).toBe('string');
      expect(typeof response.data.sourceUrl).toBe('string');
      expect(Array.isArray(response.data.features)).toBe(true);
      expect(typeof response.data.createdAt).toBe('string');
      expect(typeof response.data.estimatedCompletionTime).toBe('string');

      // Value validations
      expect([JobStatus.RUNNING, JobStatus.QUEUED]).toContain(response.data.status);
      expect(response.data.sourceUrl).toBe(requestPayload.url);
      expect(response.data.features).toEqual(requestPayload.features);
    });

    it('should accept LinkedIn profile URLs', async () => {
      const requestPayload = {
        url: 'https://www.linkedin.com/in/johndoe',
        features: ['ats_optimization']
      };

      const response = await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
      expect(response.data.sourceUrl).toBe(requestPayload.url);
    });

    it('should accept GitHub profile URLs', async () => {
      const requestPayload = {
        url: 'https://github.com/johndoe',
        features: ['portfolio_gallery']
      };

      const response = await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
      expect(response.data.sourceUrl).toBe(requestPayload.url);
    });

    it('should accept public CV URLs', async () => {
      const requestPayload = {
        url: 'https://example.com/public/johndoe-cv.pdf',
        features: ['ats_optimization', 'interactive_timeline']
      };

      const response = await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
      expect(response.data.sourceUrl).toBe(requestPayload.url);
    });

    it('should handle minimal payload with just URL', async () => {
      const requestPayload = {
        url: 'https://example.com/minimal-cv.pdf'
      };

      const response = await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
      expect(response.data.features).toEqual(['ats_optimization']); // Default feature
    });
  });

  describe('Error Cases', () => {
    it('should return 400 for missing URL', async () => {
      const requestPayload = {
        features: ['ats_optimization']
        // Missing required 'url' field
      };

      try {
        await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('error');
        expect(error.response.data).toHaveProperty('message');
        expect(error.response.data.error).toBe('MISSING_REQUIRED_FIELD');
        expect(error.response.data.message).toContain('url');
      }
    });

    it('should return 400 for invalid URL format', async () => {
      const requestPayload = {
        url: 'not-a-valid-url',
        features: ['ats_optimization']
      };

      try {
        await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('INVALID_URL_FORMAT');
      }
    });

    it('should return 401 for missing authorization', async () => {
      const requestPayload = {
        url: 'https://example.com/cv.pdf',
        features: ['ats_optimization']
      };

      try {
        await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
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

    it('should return 400 for inaccessible URL', async () => {
      const requestPayload = {
        url: 'https://private-server.internal/private-cv.pdf',
        features: ['ats_optimization']
      };

      try {
        await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('URL_NOT_ACCESSIBLE');
      }
    });

    it('should return 400 for unsupported URL source', async () => {
      const requestPayload = {
        url: 'ftp://example.com/cv.pdf', // FTP not supported
        features: ['ats_optimization']
      };

      try {
        await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('UNSUPPORTED_URL_PROTOCOL');
      }
    });
  });

  describe('Feature Validation', () => {
    it('should accept valid feature combinations', async () => {
      const requestPayload = {
        url: 'https://example.com/cv.pdf',
        features: ['ats_optimization', 'ai_podcast', 'video_introduction']
      };

      const response = await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
      expect(response.data.features).toEqual(requestPayload.features);
    });

    it('should return 400 for invalid features', async () => {
      const requestPayload = {
        url: 'https://example.com/cv.pdf',
        features: ['invalid_feature', 'another_invalid']
      };

      try {
        await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('INVALID_FEATURE_SELECTION');
      }
    });

    it('should return 400 for empty features array', async () => {
      const requestPayload = {
        url: 'https://example.com/cv.pdf',
        features: []
      };

      try {
        await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        fail('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('NO_FEATURES_SELECTED');
      }
    });
  });

  describe('Customization Validation', () => {
    it('should accept valid customizations object', async () => {
      const requestPayload = {
        url: 'https://example.com/cv.pdf',
        features: ['ats_optimization', 'video_introduction'],
        customizations: {
          ats_optimization: {
            target_keywords: ['react', 'typescript'],
            industry: 'technology'
          },
          video_introduction: {
            avatar_style: 'professional',
            voice_type: 'female'
          }
        }
      };

      const response = await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
    });

    it('should ignore customizations for unselected features', async () => {
      const requestPayload = {
        url: 'https://example.com/cv.pdf',
        features: ['ats_optimization'],
        customizations: {
          ats_optimization: { target_keywords: ['react'] },
          video_introduction: { avatar_style: 'casual' } // Not in features array
        }
      };

      const response = await axios.post(`${API_BASE_URL}/cv/url`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(201);
    });
  });
});