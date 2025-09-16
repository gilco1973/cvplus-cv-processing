/**
 * Embedding Helpers
 * Utility functions for working with text embeddings
  */

import { CVSection } from '../../../types/role-profile.types';
import { ChunkResult } from '../chunking/ChunkingUtils';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export class EmbeddingHelpers {
  static async generateEmbedding(text: string, model: string = 'text-embedding-3-small'): Promise<EmbeddingResult> {
    // This is a placeholder implementation
    // In a real implementation, this would call OpenAI's embedding API
    
    // Generate a mock embedding vector
    const dimension = 1536; // Standard dimension for text-embedding-3-small
    const embedding = Array.from({ length: dimension }, () => Math.random() * 2 - 1);
    
    return {
      embedding,
      model,
      usage: {
        promptTokens: text.split(/\s+/).length,
        totalTokens: text.split(/\s+/).length
      }
    };
  }
  
  static async generateBatchEmbeddings(texts: string[], model: string = 'text-embedding-3-small'): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    
    for (const text of texts) {
      const result = await this.generateEmbedding(text, model);
      results.push(result);
    }
    
    return results;
  }
  
  static cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimension');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return isNaN(similarity) ? 0 : similarity;
  }
  
  static findSimilarEmbeddings(
    queryEmbedding: number[], 
    candidateEmbeddings: { id: string; embedding: number[] }[],
    topK: number = 5,
    threshold: number = 0.5
  ): { id: string; similarity: number }[] {
    const similarities = candidateEmbeddings
      .map(candidate => ({
        id: candidate.id,
        similarity: this.cosineSimilarity(queryEmbedding, candidate.embedding)
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
    
    return similarities;
  }
  
  static normalizeEmbedding(embedding: number[]): number[] {
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return norm === 0 ? embedding : embedding.map(val => val / norm);
  }
  
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  static estimateTokenCount(text: string): number {
    // Rough estimation: 1 token per 4 characters on average
    return Math.ceil(text.length / 4);
  }
  
  static calculateRelevanceScore(similarity: number, metadata: any): number {
    // Base relevance on similarity with metadata-based adjustments
    let score = similarity;
    
    if (metadata?.importance) {
      score *= (1 + metadata.importance * 0.1);
    }
    
    return Math.min(1, Math.max(0, score));
  }
  
  static processCVSection(
    data: any, 
    section: CVSection, 
    chunkFunction: (text: string) => ChunkResult
  ): ChunkResult[] {
    if (!data || typeof data !== 'string') {
      return [];
    }
    
    const chunkResult = chunkFunction(data);
    // Convert single ChunkResult to array format expected by caller
    return chunkResult.chunks.map((chunk, index) => ({
      chunks: [chunk],
      metadata: [{
        ...chunkResult.metadata[index],
        section,
        processed: true
      }],
      content: chunk,
      tokenCount: chunkResult.tokenCount
    }));
  }
}