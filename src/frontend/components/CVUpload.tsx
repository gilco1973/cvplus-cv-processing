/**
 * CV Upload Component
 * 
 * Handles CV file uploads with validation, processing initiation,
 * and progress tracking. Combines FileUpload with processing logic.
 * 
 * @author Gil Klainert
 * @version 2.0.0 - Modularized Architecture
 */

import React, { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { ProcessingStatus, ProcessingStep } from './ProcessingStatus';
import { cn } from '@cvplus/core/utils';

export interface CVUploadProps {
  /** Callback when CV upload and processing is completed */
  onUploadComplete?: (result: {
    jobId: string;
    cvData: any;
    processingTime: number;
  }) => void;
  
  /** Callback when upload fails */
  onUploadError?: (error: string) => void;
  
  /** Template ID to use for processing */
  templateId?: string;
  
  /** Features to enable during processing */
  features?: string[];
  
  /** Additional CSS classes */
  className?: string;
  
  /** Whether to show detailed processing steps */
  showDetailedSteps?: boolean;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  jobId?: string;
  startTime?: Date;
  steps: ProcessingStep[];
  currentFile?: File;
}

export const CVUpload: React.FC<CVUploadProps> = ({
  onUploadComplete,
  onUploadError,
  templateId = 'modern',
  features = [],
  className = '',
  showDetailedSteps = true
}) => {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    steps: []
  });

  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      steps: []
    });
  }, []);

  const updateProgress = useCallback((progress: number, currentStep?: string) => {
    setState(prev => ({
      ...prev,
      progress,
      steps: prev.steps.map(step => 
        step.name === currentStep 
          ? { ...step, status: 'processing' as const }
          : step.status === 'processing' 
          ? { ...step, status: 'completed' as const }
          : step
      )
    }));
  }, []);

  const initializeSteps = useCallback(() => {
    const steps: ProcessingStep[] = [
      {
        id: 'upload',
        name: 'Upload File',
        description: 'Uploading CV file to secure storage',
        status: 'processing'
      },
      {
        id: 'parse',
        name: 'Parse Content',
        description: 'Extracting text and structure from CV',
        status: 'pending'
      },
      {
        id: 'analyze',
        name: 'AI Analysis',
        description: 'Analyzing CV content with Claude AI',
        status: 'pending'
      }
    ];

    if (features.includes('ats-optimization')) {
      steps.push({
        id: 'ats',
        name: 'ATS Optimization',
        description: 'Optimizing for Applicant Tracking Systems',
        status: 'pending'
      });
    }

    if (features.includes('skills-analysis')) {
      steps.push({
        id: 'skills',
        name: 'Skills Analysis',
        description: 'Analyzing and categorizing skills',
        status: 'pending'
      });
    }

    steps.push({
      id: 'finalize',
      name: 'Finalize',
      description: 'Preparing final results',
      status: 'pending'
    });

    return steps;
  }, [features]);

  const handleFileSelect = useCallback(async (file: File) => {
    const steps = initializeSteps();
    
    setState({
      status: 'uploading',
      progress: 0,
      currentFile: file,
      startTime: new Date(),
      steps
    });

    try {
      // Step 1: Upload file
      updateProgress(10, 'Upload File');
      const uploadResult = await uploadFile(file);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Step 2: Parse content
      setState(prev => ({ ...prev, status: 'processing', jobId: uploadResult.jobId }));
      updateProgress(25, 'Parse Content');
      await simulateProcessingStep(1000);
      
      // Step 3: AI Analysis
      updateProgress(50, 'AI Analysis');
      await simulateProcessingStep(2000);
      
      // Step 4: Optional features
      let currentProgress = 60;
      if (features.includes('ats-optimization')) {
        updateProgress(currentProgress, 'ATS Optimization');
        await simulateProcessingStep(1500);
        currentProgress += 15;
      }
      
      if (features.includes('skills-analysis')) {
        updateProgress(currentProgress, 'Skills Analysis');
        await simulateProcessingStep(1000);
        currentProgress += 10;
      }
      
      // Step 5: Finalize
      updateProgress(90, 'Finalize');
      await simulateProcessingStep(500);
      
      // Complete
      setState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        steps: prev.steps.map(step => ({ ...step, status: 'completed' as const }))
      }));

      // Simulate processing result
      const result = {
        jobId: uploadResult.jobId,
        cvData: { /* processed CV data */ },
        processingTime: Date.now() - (state.startTime?.getTime() || Date.now())
      };

      onUploadComplete?.(result);

    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
        steps: prev.steps.map(step => 
          step.status === 'processing' 
            ? { ...step, status: 'failed' as const, error: errorMessage }
            : step
        )
      }));
      
      onUploadError?.(errorMessage);
    }
  }, [features, onUploadComplete, onUploadError, updateProgress, initializeSteps, state.startTime]);

  const handleRetry = useCallback(() => {
    if (state.currentFile) {
      handleFileSelect(state.currentFile);
    } else {
      resetState();
    }
  }, [state.currentFile, handleFileSelect, resetState]);

  const handleCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  // Show file upload interface when idle
  if (state.status === 'idle') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Your CV
          </h2>
          <p className="text-gray-600">
            Upload your CV to get started with AI-powered analysis and enhancement
          </p>
        </div>
        
        <FileUpload 
          onFileSelect={handleFileSelect}
          isLoading={false}
        />

        {features.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Selected Features:
            </h3>
            <div className="flex flex-wrap gap-2">
              {features.map(feature => (
                <span
                  key={feature}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show processing status
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Processing Your CV
        </h2>
        <p className="text-gray-600">
          {state.currentFile?.name || 'Your CV'} is being processed...
        </p>
      </div>
      
      <ProcessingStatus
        status={state.status}
        progress={state.progress}
        steps={showDetailedSteps ? state.steps : []}
        startTime={state.startTime}
        estimatedTime={features.length > 0 ? 8000 : 5000}
        error={state.error}
        onRetry={handleRetry}
        onCancel={state.status === 'processing' ? handleCancel : undefined}
        className="max-w-2xl mx-auto"
      />

      {state.status === 'completed' && (
        <div className="text-center">
          <button
            onClick={resetState}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Upload Another CV
          </button>
        </div>
      )}
    </div>
  );
};

// Helper functions

async function uploadFile(file: File): Promise<{ success: boolean; jobId?: string; error?: string }> {
  // Simulate file upload
  return new Promise((resolve) => {
    setTimeout(() => {
      if (file.size > 10 * 1024 * 1024) {
        resolve({ success: false, error: 'File too large' });
      } else {
        resolve({ 
          success: true, 
          jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }, 1000);
  });
}

async function simulateProcessingStep(duration: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}