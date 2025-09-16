// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * T010: CV processing logging test in packages/cv-processing/src/__tests__/processing-logging.integration.test.ts
 * CRITICAL: This test MUST FAIL before implementation
 */

import { ProcessingLogger } from '../logging/ProcessingLogger';
import { LogLevel, LogDomain } from '@cvplus/logging/backend';

describe('ProcessingLogger Integration', () => {
  let processingLogger: ProcessingLogger;

  beforeEach(() => {
    processingLogger = new ProcessingLogger('cv-processing-service-test');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CV Processing Event Logging', () => {
    it('should log CV processing start with correlation ID', async () => {
      const mockProcessingRequest = {
        userId: 'user-cv-test',
        cvId: 'cv-123',
        requestedFeatures: ['ats_optimization', 'personality_insights'],
        fileSize: 1024,
        fileType: 'application/pdf'
      };

      const correlationId = processingLogger.processingStarted(mockProcessingRequest);

      expect(correlationId).toBeDefined();
      expect(correlationId).toMatch(/^[a-zA-Z0-9\-_]{21}$/);

      const logEntry = processingLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.INFO,
        domain: LogDomain.BUSINESS,
        message: 'CV processing started',
        context: {
          event: 'PROCESSING_STARTED',
          userId: 'user-cv-test',
          cvId: 'cv-123',
          requestedFeatures: ['ats_optimization', 'personality_insights'],
          fileSize: 1024,
          fileType: 'application/pdf'
        },
        correlationId: expect.any(String)
      });
    });

    it('should log CV processing completion with performance metrics', async () => {
      const mockCompletionData = {
        cvId: 'cv-completion-test',
        processingDuration: 45000, // 45 seconds
        featuresCompleted: ['ats_optimization', 'skills_extraction'],
        qualityScore: 0.92,
        wordCount: 850
      };

      const correlationId = processingLogger.processingCompleted(mockCompletionData);

      expect(correlationId).toBeDefined();

      const logEntry = processingLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.INFO,
        domain: LogDomain.PERFORMANCE,
        message: 'CV processing completed',
        context: {
          event: 'PROCESSING_COMPLETED',
          cvId: 'cv-completion-test',
          featuresCompleted: ['ats_optimization', 'skills_extraction'],
          qualityScore: 0.92,
          wordCount: 850
        },
        performance: {
          duration: 45000
        }
      });
    });

    it('should log CV processing errors with error details', async () => {
      const mockError = {
        cvId: 'cv-error-test',
        errorType: 'PARSING_ERROR',
        errorMessage: 'Unable to extract text from PDF',
        attemptedFeatures: ['text_extraction', 'ats_optimization'],
        processingDuration: 12000
      };

      const correlationId = processingLogger.processingFailed(mockError);

      expect(correlationId).toBeDefined();

      const logEntry = processingLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.ERROR,
        domain: LogDomain.SYSTEM,
        message: 'CV processing failed',
        context: {
          event: 'PROCESSING_FAILED',
          cvId: 'cv-error-test',
          errorType: 'PARSING_ERROR',
          attemptedFeatures: ['text_extraction', 'ats_optimization']
        },
        error: {
          message: 'Unable to extract text from PDF',
          code: 'PARSING_ERROR'
        },
        performance: {
          duration: 12000
        }
      });
    });

    it('should log feature-specific processing events', async () => {
      const featureTests = [
        {
          feature: 'ats_optimization',
          data: { score: 0.85, recommendations: 12 },
          expectedMessage: 'ATS optimization completed'
        },
        {
          feature: 'personality_insights',
          data: { traits: ['openness', 'conscientiousness'], confidence: 0.78 },
          expectedMessage: 'Personality insights generated'
        },
        {
          feature: 'skills_extraction',
          data: { skillsFound: 24, categories: ['technical', 'soft'] },
          expectedMessage: 'Skills extraction completed'
        }
      ];

      featureTests.forEach(({ feature, data, expectedMessage }) => {
        const correlationId = processingLogger.featureProcessed(feature, data);

        expect(correlationId).toBeDefined();

        const logs = processingLogger.getAllLogEntries();
        const latestLog = logs[logs.length - 1];

        expect(latestLog).toMatchObject({
          level: LogLevel.INFO,
          domain: LogDomain.BUSINESS,
          message: expectedMessage,
          context: {
            event: 'FEATURE_PROCESSED',
            feature,
            ...data
          }
        });
      });
    });

    it('should log AI service API calls with costs and performance', async () => {
      const mockAPICall = {
        service: 'OpenAI GPT-4',
        endpoint: '/v1/chat/completions',
        tokens: 1500,
        cost: 0.045,
        duration: 2300,
        success: true
      };

      const correlationId = processingLogger.aiServiceCalled(mockAPICall);

      expect(correlationId).toBeDefined();

      const logEntry = processingLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.INFO,
        domain: LogDomain.PERFORMANCE,
        message: 'AI service API call completed',
        context: {
          event: 'AI_SERVICE_CALLED',
          service: 'OpenAI GPT-4',
          endpoint: '/v1/chat/completions',
          tokens: 1500,
          cost: 0.045,
          success: true
        },
        performance: {
          duration: 2300
        }
      });
    });
  });

  describe('Correlation Tracking', () => {
    it('should maintain correlation ID throughout processing pipeline', async () => {
      const initialCorrelationId = processingLogger.processingStarted({
        userId: 'user-correlation',
        cvId: 'cv-correlation-test',
        requestedFeatures: ['ats_optimization']
      });

      // Subsequent operations should use same correlation ID
      const featureCorrelationId = processingLogger.withCorrelation(initialCorrelationId, () => {
        return processingLogger.featureProcessed('ats_optimization', { score: 0.9 });
      });

      const completionCorrelationId = processingLogger.withCorrelation(initialCorrelationId, () => {
        return processingLogger.processingCompleted({
          cvId: 'cv-correlation-test',
          processingDuration: 30000,
          featuresCompleted: ['ats_optimization'],
          qualityScore: 0.9
        });
      });

      expect(featureCorrelationId).toBe(initialCorrelationId);
      expect(completionCorrelationId).toBe(initialCorrelationId);

      const allLogs = processingLogger.getAllLogEntries();
      expect(allLogs).toHaveLength(3);

      // All logs should have the same correlation ID
      allLogs.forEach(log => {
        expect(log.correlationId).toBe(initialCorrelationId);
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track processing performance metrics', async () => {
      const performanceTests = [
        { duration: 15000, expectLevel: LogLevel.INFO }, // Fast processing
        { duration: 45000, expectLevel: LogLevel.INFO }, // Normal processing
        { duration: 90000, expectLevel: LogLevel.WARN }, // Slow processing
        { duration: 180000, expectLevel: LogLevel.ERROR } // Very slow processing
      ];

      performanceTests.forEach(({ duration, expectLevel }, index) => {
        processingLogger.processingCompleted({
          cvId: `cv-perf-test-${index}`,
          processingDuration: duration,
          featuresCompleted: ['basic'],
          qualityScore: 0.8
        });

        const logs = processingLogger.getAllLogEntries();
        const latestLog = logs[logs.length - 1];

        expect(latestLog.level).toBe(expectLevel);
        expect(latestLog.performance?.duration).toBe(duration);
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should log retry attempts and recovery strategies', async () => {
      const mockRetryScenario = {
        cvId: 'cv-retry-test',
        feature: 'ai_analysis',
        attempt: 2,
        maxAttempts: 3,
        lastError: 'OpenAI API rate limit exceeded',
        retryDelay: 5000
      };

      const correlationId = processingLogger.retryAttempt(mockRetryScenario);

      expect(correlationId).toBeDefined();

      const logEntry = processingLogger.getLastLogEntry();
      expect(logEntry).toMatchObject({
        level: LogLevel.WARN,
        domain: LogDomain.SYSTEM,
        message: 'Processing retry attempt',
        context: {
          event: 'RETRY_ATTEMPT',
          cvId: 'cv-retry-test',
          feature: 'ai_analysis',
          attempt: 2,
          maxAttempts: 3,
          retryDelay: 5000
        },
        error: {
          message: 'OpenAI API rate limit exceeded'
        }
      });
    });
  });
});