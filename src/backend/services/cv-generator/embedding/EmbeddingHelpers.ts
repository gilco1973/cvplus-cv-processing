/**
 * Embedding Service Helper Functions
 * 
 * Supporting utilities for the main embedding service
 * 
 * @version 1.0.0
 * @author Gil Klainert
 */

import { EmbeddingMetadata, CVSection, ContentType } from '../../../types/portal';
import { ChunkResult } from '../chunking/ChunkingUtils';

/**
 * Helper functions for embedding processing
 */
export class EmbeddingHelpers {
  
  /**
   * Calculate relevance score based on similarity and metadata
   */
  static calculateRelevanceScore(similarity: number, metadata: EmbeddingMetadata): number {
    let score = similarity;
    
    // Boost score based on importance
    if (metadata.importance) {
      score *= metadata.importance;
    }
    
    // Section-based boosting
    const sectionWeights = {
      'experience': 1.2,
      'skills': 1.1,
      'education': 1.0,
      'achievements': 1.3,
      'general': 1.0
    };
    
    const weight = sectionWeights[metadata.section as keyof typeof sectionWeights] || 1.0;
    score *= weight;
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Process CV section into chunks with appropriate metadata
   */
  static processCVSection(sectionData: any, sectionType: CVSection, chunkText: Function): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    
    if (Array.isArray(sectionData)) {
      sectionData.forEach((item, index) => {
        const text = this.extractTextFromItem(item);
        if (text) {
          const sectionChunks = chunkText(text, {
            strategy: 'semantic',
            maxTokens: 400,
            cvSectionAware: true
          });
          
          sectionChunks.forEach((chunk: ChunkResult) => {
            chunk.metadata.section = sectionType;
            chunk.metadata.subsection = `${sectionType}_${index}`;
            chunks.push(chunk);
          });
        }
      });
    } else if (typeof sectionData === 'object') {
      const text = this.extractTextFromItem(sectionData);
      if (text) {
        const sectionChunks = chunkText(text, {
          strategy: 'semantic',
          maxTokens: 400,
          cvSectionAware: true
        });
        
        sectionChunks.forEach((chunk: ChunkResult) => {
          chunk.metadata.section = sectionType;
          chunks.push(chunk);
        });
      }
    }
    
    return chunks;
  }

  /**
   * Extract text content from CV item object
   */
  static extractTextFromItem(item: any): string {
    if (typeof item === 'string') return item;
    
    const textParts: string[] = [];
    
    // Common CV item properties
    if (item.title) textParts.push(item.title);
    if (item.company) textParts.push(item.company);
    if (item.position) textParts.push(item.position);
    if (item.description) textParts.push(item.description);
    if (item.responsibilities) {
      const resp = Array.isArray(item.responsibilities) 
        ? item.responsibilities.join(' ') 
        : item.responsibilities;
      textParts.push(resp);
    }
    if (item.achievements) {
      const ach = Array.isArray(item.achievements)
        ? item.achievements.join(' ')
        : item.achievements;
      textParts.push(ach);
    }
    if (item.skills) {
      const skills = Array.isArray(item.skills)
        ? item.skills.join(', ')
        : item.skills;
      textParts.push(skills);
    }
    
    return textParts.join(' ').trim();
  }

  /**
   * Create delay for rate limiting
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Estimate token count for text (rough approximation)
   */
  static estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}