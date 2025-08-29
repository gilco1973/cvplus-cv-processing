/**
 * CV Embedding Processor for CVPlus RAG System
 * 
 * Handles CV-specific embedding processing and optimization
 * 
 * @version 1.0.0
 * @author Gil Klainert
 */

import { ParsedCV } from '../../../types/enhanced-models';
import { RAGEmbedding, CVSection } from '../../../types/portal';
import { ChunkResult } from '../chunking/ChunkingUtils';
import { EmbeddingHelpers } from './EmbeddingHelpers';

/**
 * CV embedding processing result
 */
export interface CVEmbeddingResult {
  embeddings: RAGEmbedding[];
  totalChunks: number;
  totalTokens: number;
  processingTime: number;
  sectionsProcessed: string[];
}

/**
 * HuggingFace export configuration
 */
export interface HuggingFaceExport {
  embeddings: RAGEmbedding[];
  model: string;
  version: string;
  exportFormat: 'json' | 'parquet';
  optimizedForOffline: boolean;
}

/**
 * CV embedding processor utility class
 */
export class CVEmbeddingProcessor {
  
  /**
   * Process CV data into embeddings with section-aware chunking
   */
  static async processCV(
    cvData: ParsedCV, 
    chunkTextFn: Function, 
    generateEmbeddingsFn: Function
  ): Promise<CVEmbeddingResult> {
    const startTime = Date.now();
    const sectionsProcessed: string[] = [];
    const allChunks: ChunkResult[] = [];

    // Process CV sections with appropriate chunking
    if (cvData.experience) {
      allChunks.push(...EmbeddingHelpers.processCVSection(
        cvData.experience, CVSection.EXPERIENCE, chunkTextFn
      ));
      sectionsProcessed.push('experience');
    }

    if (cvData.education) {
      allChunks.push(...EmbeddingHelpers.processCVSection(
        cvData.education, CVSection.EDUCATION, chunkTextFn
      ));
      sectionsProcessed.push('education');
    }

    if (cvData.skills) {
      allChunks.push(...EmbeddingHelpers.processCVSection(
        cvData.skills, CVSection.SKILLS, chunkTextFn
      ));
      sectionsProcessed.push('skills');
    }

    if (cvData.achievements) {
      allChunks.push(...EmbeddingHelpers.processCVSection(
        cvData.achievements, CVSection.ACHIEVEMENTS, chunkTextFn
      ));
      sectionsProcessed.push('achievements');
    }

    if (cvData.projects) {
      allChunks.push(...EmbeddingHelpers.processCVSection(
        cvData.projects, CVSection.PROJECTS, chunkTextFn
      ));
      sectionsProcessed.push('projects');
    }

    if (cvData.certifications) {
      allChunks.push(...EmbeddingHelpers.processCVSection(
        cvData.certifications, CVSection.CERTIFICATIONS, chunkTextFn
      ));
      sectionsProcessed.push('certifications');
    }

    // Generate embeddings for all chunks
    const texts = allChunks.map(chunk => chunk.content);
    const embeddings = await generateEmbeddingsFn(texts);
    
    // Enhance embeddings with chunk metadata
    const enhancedEmbeddings = embeddings.map((embedding: RAGEmbedding, index: number) => ({
      ...embedding,
      metadata: {
        ...embedding.metadata,
        ...allChunks[index].metadata
      }
    }));

    const processingTime = Date.now() - startTime;
    const totalTokens = allChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);

    return {
      embeddings: enhancedEmbeddings,
      totalChunks: allChunks.length,
      totalTokens,
      processingTime,
      sectionsProcessed
    };
  }

  /**
   * Optimize embeddings for HuggingFace deployment
   */
  static optimizeForHuggingFace(
    embeddings: RAGEmbedding[], 
    model: string
  ): HuggingFaceExport {
    // Filter and optimize embeddings for offline deployment
    const optimizedEmbeddings = embeddings.filter(emb => 
      emb.metadata.importance && emb.metadata.importance > 0.5
    );

    return {
      embeddings: optimizedEmbeddings,
      model,
      version: '2.0.0',
      exportFormat: 'json',
      optimizedForOffline: true
    };
  }

  /**
   * Calculate processing statistics for monitoring
   */
  static calculateProcessingStats(result: CVEmbeddingResult): {
    efficiency: number;
    averageTokensPerChunk: number;
    processingRate: number;
    sectionsPerSecond: number;
  } {
    const efficiency = result.totalTokens > 0 ? 
      (result.totalChunks / result.totalTokens) * 1000 : 0;
    
    const averageTokensPerChunk = result.totalChunks > 0 ? 
      result.totalTokens / result.totalChunks : 0;
    
    const processingRate = result.processingTime > 0 ? 
      result.totalChunks / (result.processingTime / 1000) : 0;
    
    const sectionsPerSecond = result.processingTime > 0 ? 
      result.sectionsProcessed.length / (result.processingTime / 1000) : 0;

    return {
      efficiency,
      averageTokensPerChunk,
      processingRate,
      sectionsPerSecond
    };
  }

  /**
   * Validate CV data before processing
   */
  static validateCVData(cvData: ParsedCV): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required sections
    if (!cvData.personalInfo) {
      errors.push('Missing personal information section');
    }

    if (!cvData.experience && !cvData.education && !cvData.skills) {
      errors.push('CV must have at least one of: work experience, education, or skills');
    }

    // Check for content quality
    if (cvData.experience && Array.isArray(cvData.experience)) {
      const emptyExperiences = cvData.experience.filter(exp => 
        !exp.description
      );
      if (emptyExperiences.length > 0) {
        warnings.push(`${emptyExperiences.length} work experience entries lack description`);
      }
    }

    if (cvData.skills && Array.isArray(cvData.skills) && cvData.skills.length === 0) {
      warnings.push('Skills section is empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}