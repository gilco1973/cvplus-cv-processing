// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * CVProcessingService Tests (T071)
 *
 * Comprehensive test suite for the enhanced CV Processing Service.
 * Tests all major functionality including file upload, processing management,
 * real-time updates, error handling, and performance optimizations.
 *
 * @version 1.0.0 - T071 Test Implementation
 * @author Gil Klainert
 */

import { describe, it, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import { CVProcessingService, ProcessingError, ProcessingFeature, ProcessingPriority, ExportFormat, ProcessingJobStatus } from '../CVProcessingService';

// Mock Firebase
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => vi.fn())
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: {
      uid: 'test-user-id',
      accessToken: 'test-token'
    }
  }))
}));

describe('CVProcessingService', () => {
  let service: CVProcessingService;
  let mockFile: File;

  beforeEach(() => {
    // Reset singleton instance
    (CVProcessingService as any).instance = undefined;
    service = CVProcessingService.getInstance();

    // Create mock file
    mockFile = new File(['test content'], 'test-cv.pdf', {
      type: 'application/pdf',
      lastModified: Date.now()
    });

    // Mock EventSource
    global.EventSource = vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      onmessage: null,
      onerror: null
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CVProcessingService.getInstance();
      const instance2 = CVProcessingService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('File Validation', () => {
    it('should validate file size', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf'
      });

      const result = (service as any).validateFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File size exceeds 10MB limit');
    });

    it('should validate file type', () => {
      const invalidFile = new File(['test'], 'test.exe', {
        type: 'application/exe'
      });

      const result = (service as any).validateFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File type not supported. Please upload PDF, DOCX, DOC, or TXT files.');
    });

    it('should validate file name', () => {
      const invalidFile = new File(['test'], '', {
        type: 'application/pdf'
      });

      const result = (service as any).validateFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File must have a valid name');
    });

    it('should pass validation for valid file', () => {
      const result = (service as any).validateFile(mockFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests under rate limit', () => {
      const result = (service as any).checkRateLimit('user1', 'upload');
      expect(result).toBe(true);
    });

    it('should block requests over rate limit', () => {
      // Simulate multiple requests
      for (let i = 0; i < 10; i++) {
        (service as any).checkRateLimit('user1', 'upload');
      }

      const result = (service as any).checkRateLimit('user1', 'upload');
      expect(result).toBe(false);
    });

    it('should reset rate limit after window', async () => {
      // Fill up rate limit
      for (let i = 0; i < 10; i++) {
        (service as any).checkRateLimit('user1', 'upload');
      }

      // Manually reset rate limiter for testing
      (service as any).rateLimiters.delete('user1_upload');

      const result = (service as any).checkRateLimit('user1', 'upload');
      expect(result).toBe(true);
    });
  });

  describe('Caching', () => {
    it('should cache upload URLs', async () => {
      const cacheKey = `${mockFile.name}_${mockFile.size}_${mockFile.lastModified}`;
      const testUrl = 'https://test.com/file.pdf';

      // Set cache
      (service as any).uploadCache.set(cacheKey, {
        data: testUrl,
        timestamp: Date.now()
      });

      // Check cache
      const cached = (service as any).uploadCache.get(cacheKey);
      expect(cached.data).toBe(testUrl);
    });

    it('should detect expired cache entries', () => {
      const expiredEntry = {
        data: 'test',
        timestamp: Date.now() - 10 * 60 * 1000 // 10 minutes ago
      };

      const result = (service as any).isCacheExpired(expiredEntry);
      expect(result).toBe(true);
    });

    it('should detect valid cache entries', () => {
      const validEntry = {
        data: 'test',
        timestamp: Date.now() // Now
      };

      const result = (service as any).isCacheExpired(validEntry);
      expect(result).toBe(false);
    });

    it('should clear all caches', () => {
      // Add some cache entries
      (service as any).uploadCache.set('test1', { data: 'value1', timestamp: Date.now() });
      (service as any).templateCache.set('test2', { data: 'value2', timestamp: Date.now() });

      service.clearCaches();

      expect((service as any).uploadCache.size).toBe(0);
      expect((service as any).templateCache.size).toBe(0);
    });
  });

  describe('Job Management', () => {
    it('should create and store jobs', () => {
      const jobId = 'test-job-id';
      const mockJob = {
        id: jobId,
        backendJobId: jobId,
        status: ProcessingJobStatus.QUEUED,
        progress: 0,
        stages: [],
        file: mockFile,
        options: {
          features: [ProcessingFeature.ANALYSIS],
          priority: ProcessingPriority.NORMAL
        },
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'test-user-id'
      };

      (service as any).activeJobs.set(jobId, mockJob);

      const retrievedJob = service.getJob(jobId);
      expect(retrievedJob).toEqual(mockJob);
    });

    it('should return all active jobs', () => {
      const job1 = { id: 'job1', status: ProcessingJobStatus.PROCESSING } as any;
      const job2 = { id: 'job2', status: ProcessingJobStatus.COMPLETED } as any;

      (service as any).activeJobs.set('job1', job1);
      (service as any).activeJobs.set('job2', job2);

      const activeJobs = service.getActiveJobs();
      expect(activeJobs).toHaveLength(2);
      expect(activeJobs).toContain(job1);
      expect(activeJobs).toContain(job2);
    });

    it('should remove jobs', () => {
      const jobId = 'test-job-id';
      const mockJob = { id: jobId } as any;

      (service as any).activeJobs.set(jobId, mockJob);
      expect(service.getJob(jobId)).toBeDefined();

      service.removeJob(jobId);
      expect(service.getJob(jobId)).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should create ProcessingError with code', () => {
      const error = new ProcessingError('Test error', 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('ProcessingError');
    });

    it('should handle authentication errors', async () => {
      // Mock unauthenticated user
      vi.mocked((await import('firebase/auth')).getAuth).mockReturnValue({
        currentUser: null
      } as any);

      const uploadOptions = {
        features: [ProcessingFeature.ANALYSIS],
        priority: ProcessingPriority.NORMAL
      };

      const result = await service.uploadCV(mockFile, uploadOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle validation errors', async () => {
      const invalidFile = new File(['test'], 'test.exe', {
        type: 'application/exe'
      });

      const uploadOptions = {
        features: [ProcessingFeature.ANALYSIS],
        priority: ProcessingPriority.NORMAL
      };

      const result = await service.uploadCV(invalidFile, uploadOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File type not supported');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed operations', async () => {
      let attemptCount = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
        return Promise.resolve({ data: 'success' });
      });

      const result = await (service as any).withRetry(mockFn, 'test-operation', 3);

      expect(attemptCount).toBe(3);
      expect(result.data).toBe('success');
    });

    it('should give up after max retries', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(
        (service as any).withRetry(mockFn, 'test-operation', 2)
      ).rejects.toThrow('Persistent error');

      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Real-time Updates', () => {
    it('should create EventSource for job updates', () => {
      const jobId = 'test-job-id';
      const mockJob = {
        id: jobId,
        backendJobId: 'backend-job-id',
        userId: 'test-user-id'
      } as any;

      (service as any).activeJobs.set(jobId, mockJob);

      const eventSource = service.subscribeToUpdates(jobId);

      expect(EventSource).toHaveBeenCalledWith(
        expect.stringContaining('/api/cv-processing/status-stream/backend-job-id')
      );
      expect((service as any).eventSources.has(jobId)).toBe(true);
    });

    it('should close EventSource on unsubscribe', () => {
      const jobId = 'test-job-id';
      const mockEventSource = {
        close: vi.fn()
      };

      (service as any).eventSources.set(jobId, mockEventSource);

      service.unsubscribeFromUpdates(jobId);

      expect(mockEventSource.close).toHaveBeenCalled();
      expect((service as any).eventSources.has(jobId)).toBe(false);
    });

    it('should handle status updates', () => {
      const jobId = 'test-job-id';
      const mockJob = {
        id: jobId,
        status: ProcessingJobStatus.PROCESSING,
        progress: 50
      } as any;

      (service as any).activeJobs.set(jobId, mockJob);

      const statusData = {
        status: ProcessingJobStatus.COMPLETED,
        progress: 100,
        result: { success: true }
      };

      (service as any).handleStatusUpdate(jobId, statusData);

      const updatedJob = service.getJob(jobId);
      expect(updatedJob.status).toBe(ProcessingJobStatus.COMPLETED);
      expect(updatedJob.progress).toBe(100);
      expect(updatedJob.result).toEqual({ success: true });
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should calculate processing statistics', () => {
      const completedJob = { status: ProcessingJobStatus.COMPLETED } as any;
      const failedJob = { status: ProcessingJobStatus.FAILED } as any;
      const activeJob = { status: ProcessingJobStatus.PROCESSING } as any;

      (service as any).activeJobs.set('job1', completedJob);
      (service as any).activeJobs.set('job2', failedJob);
      (service as any).activeJobs.set('job3', activeJob);

      const stats = service.getProcessingStats();

      expect(stats.totalJobs).toBe(3);
      expect(stats.completedJobs).toBe(1);
      expect(stats.failedJobs).toBe(1);
      expect(stats.activeJobs).toBe(1);
      expect(stats.successRate).toBe(33.33333333333333); // 1/3 * 100
    });

    it('should handle empty job statistics', () => {
      const stats = service.getProcessingStats();

      expect(stats.totalJobs).toBe(0);
      expect(stats.completedJobs).toBe(0);
      expect(stats.failedJobs).toBe(0);
      expect(stats.activeJobs).toBe(0);
      expect(stats.successRate).toBe(0);
    });
  });

  describe('Template Management', () => {
    it('should cache template results', async () => {
      const mockTemplates = [
        { id: 'template1', name: 'Modern' },
        { id: 'template2', name: 'Professional' }
      ];

      // Mock the Firebase function call
      const mockGetTemplates = vi.fn().mockResolvedValue({
        data: { success: true, templates: mockTemplates }
      });

      vi.mocked((await import('firebase/functions')).httpsCallable).mockReturnValue(mockGetTemplates);

      const templates = await service.getTemplates();

      expect(templates).toEqual(mockTemplates);
      expect((service as any).templateCache.has('all_templates')).toBe(true);
    });
  });

  describe('Export Operations', () => {
    it('should export CV in different formats', async () => {
      const jobId = 'test-job-id';
      const mockJob = { id: jobId, backendJobId: 'backend-job-id' } as any;
      (service as any).activeJobs.set(jobId, mockJob);

      const mockExportResult = {
        url: 'https://test.com/export.pdf',
        size: 1024,
        generatedAt: new Date().toISOString(),
        metadata: { pages: 2 }
      };

      const mockExportCV = vi.fn().mockResolvedValue({
        data: { success: true, ...mockExportResult }
      });

      vi.mocked((await import('firebase/functions')).httpsCallable).mockReturnValue(mockExportCV);

      const result = await service.exportCV(jobId, ExportFormat.PDF);

      expect(result.format).toBe(ExportFormat.PDF);
      expect(result.url).toBe(mockExportResult.url);
      expect(result.size).toBe(mockExportResult.size);
    });

    it('should handle export errors', async () => {
      const jobId = 'nonexistent-job';

      await expect(service.exportCV(jobId, ExportFormat.PDF))
        .rejects.toThrow('Job nonexistent-job not found');
    });
  });

  describe('Queue Management', () => {
    it('should process request queue in priority order', async () => {
      const processOrder: string[] = [];

      // Mock the queue processing method
      const originalProcessQueuedRequest = (service as any).processQueuedRequest;
      (service as any).processQueuedRequest = vi.fn().mockImplementation((request) => {
        processOrder.push(`${request.jobId}_${request.priority}`);
        return Promise.resolve();
      });

      // Add requests with different priorities
      await (service as any).queueProcessingRequest({
        type: 'process',
        jobId: 'job1',
        payload: {},
        retryCount: 0,
        priority: ProcessingPriority.LOW
      });

      await (service as any).queueProcessingRequest({
        type: 'process',
        jobId: 'job2',
        payload: {},
        retryCount: 0,
        priority: ProcessingPriority.URGENT
      });

      await (service as any).queueProcessingRequest({
        type: 'process',
        jobId: 'job3',
        payload: {},
        retryCount: 0,
        priority: ProcessingPriority.HIGH
      });

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify priority order (URGENT > HIGH > LOW)
      expect(processOrder[0]).toBe('job2_urgent');
      expect(processOrder[1]).toBe('job3_high');
      expect(processOrder[2]).toBe('job1_low');

      // Restore original method
      (service as any).processQueuedRequest = originalProcessQueuedRequest;
    });
  });

  describe('Performance Monitoring', () => {
    it('should track cache hit rate', () => {
      const stats = service.getProcessingStats();
      expect(stats.cacheHitRate).toBeTypeOf('number');
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(stats.cacheHitRate).toBeLessThanOrEqual(100);
    });

    it('should track queue length', () => {
      const stats = service.getProcessingStats();
      expect(stats.queueLength).toBeTypeOf('number');
      expect(stats.queueLength).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Features', () => {
    it('should handle job status conversion', () => {
      const mockJob = {
        id: 'test-job-id',
        status: ProcessingJobStatus.COMPLETED,
        progress: 100,
        currentStage: 'finished',
        stages: [],
        result: { success: true },
        error: null,
        estimatedCompletion: new Date(),
        retryCount: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;

      const status = (service as any).jobToStatus(mockJob);

      expect(status.jobId).toBe('test-job-id');
      expect(status.status).toBe(ProcessingJobStatus.COMPLETED);
      expect(status.progress).toBe(100);
      expect(status.result).toEqual({ success: true });
      expect(status.metadata.retryCount).toBe(2);
    });
  });

  describe('Memory Management', () => {
    it('should clean up resources on job removal', () => {
      const jobId = 'test-job-id';
      const mockJob = { id: jobId } as any;
      const mockEventSource = { close: vi.fn() } as any;
      const mockTimeout = setTimeout(() => {}, 1000);

      (service as any).activeJobs.set(jobId, mockJob);
      (service as any).eventSources.set(jobId, mockEventSource);
      (service as any).retryTimeouts.set(jobId, mockTimeout);

      service.removeJob(jobId);

      expect((service as any).activeJobs.has(jobId)).toBe(false);
      expect((service as any).eventSources.has(jobId)).toBe(false);
      expect((service as any).retryTimeouts.has(jobId)).toBe(false);
      expect(mockEventSource.close).toHaveBeenCalled();
    });
  });
});