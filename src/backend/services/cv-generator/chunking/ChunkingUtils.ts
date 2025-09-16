// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * Text Chunking Utilities for CV Embedding Service
 * 
 * Provides intelligent text chunking strategies for optimal embedding generation
 * 
 * @version 1.0.0
 * @author Gil Klainert
 */

import { EmbeddingMetadata, CVSection, ContentType } from '../../../types/portal';

/**
 * Chunking options interface
 */
export interface ChunkingConfig {
  strategy: 'semantic' | 'fixed-size' | 'sliding-window';
  maxTokens: number;
  overlap: number;
  preserveContext: boolean;
  cvSectionAware: boolean;
}

/**
 * Chunking result interface
 */
export interface ChunkResult {
  content: string;
  metadata: EmbeddingMetadata;
  tokenCount: number;
  chunkIndex: number;
}

/**
 * Text chunking utilities class
 */
export class ChunkingUtils {
  
  /**
   * Semantic chunking based on content structure
   */
  static semanticChunking(text: string, config: ChunkingConfig): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    
    // Split by paragraphs first for semantic coherence
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const paragraph of paragraphs) {
      const proposedChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
      const tokenCount = this.estimateTokenCount(proposedChunk);
      
      if (tokenCount <= config.maxTokens) {
        currentChunk = proposedChunk;
      } else {
        // Save current chunk if it has content
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: {
              section: CVSection.SUMMARY,
              importance: 1.0,
              tags: ['semantic'],
              source: 'summary'
            },
            tokenCount: this.estimateTokenCount(currentChunk),
            chunkIndex: chunkIndex++
          });
        }
        
        // Handle oversized paragraphs
        if (this.estimateTokenCount(paragraph) > config.maxTokens) {
          const subChunks = this.splitLargeParagraph(paragraph, config.maxTokens);
          for (const subChunk of subChunks) {
            chunks.push({
              content: subChunk.trim(),
              metadata: {
                section: CVSection.SUMMARY,
                importance: 1.0,
                tags: ['semantic-split'],
                source: 'summary'
              },
              tokenCount: this.estimateTokenCount(subChunk),
              chunkIndex: chunkIndex++
            });
          }
          currentChunk = '';
        } else {
          currentChunk = paragraph;
        }
      }
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          section: CVSection.SUMMARY,
          importance: 1.0,
          tags: ['semantic'],
          source: 'summary'
        },
        tokenCount: this.estimateTokenCount(currentChunk),
        chunkIndex: chunkIndex++
      });
    }
    
    return chunks;
  }
  
  /**
   * Fixed-size chunking with overlap
   */
  static fixedSizeChunking(text: string, config: ChunkingConfig): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    const words = text.split(/\s+/);
    const approxTokensPerWord = 0.75; // Rough estimate
    const wordsPerChunk = Math.floor(config.maxTokens / approxTokensPerWord);
    const overlapWords = Math.floor(config.overlap / approxTokensPerWord);
    
    let chunkIndex = 0;
    
    for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const content = chunkWords.join(' ');
      
      if (content.trim()) {
        chunks.push({
          content: content.trim(),
          metadata: {
            section: CVSection.SUMMARY,
            importance: 1.0,
            tags: ['fixed-size'],
            source: 'summary'
          },
          tokenCount: this.estimateTokenCount(content),
          chunkIndex: chunkIndex++
        });
      }
    }
    
    return chunks;
  }
  
  /**
   * Sliding window chunking for continuous context
   */
  static slidingWindowChunking(text: string, config: ChunkingConfig): ChunkResult[] {
    const chunks: ChunkResult[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentWindow = '';
    let chunkIndex = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim() + '.';
      const proposedWindow = currentWindow ? `${currentWindow} ${sentence}` : sentence;
      
      if (this.estimateTokenCount(proposedWindow) <= config.maxTokens) {
        currentWindow = proposedWindow;
      } else {
        if (currentWindow) {
          chunks.push({
            content: currentWindow.trim(),
            metadata: {
              section: CVSection.SUMMARY,
              importance: 1.0,
              tags: ['sliding-window'],
              source: 'summary'
            },
            tokenCount: this.estimateTokenCount(currentWindow),
            chunkIndex: chunkIndex++
          });
          
          // Start new window with overlap
          const overlapSentences = Math.ceil(config.overlap / 100); // Percentage to sentence count
          const startIndex = Math.max(0, i - overlapSentences);
          currentWindow = sentences.slice(startIndex, i + 1).join('. ') + '.';
        } else {
          currentWindow = sentence;
        }
      }
    }
    
    // Add final window
    if (currentWindow.trim()) {
      chunks.push({
        content: currentWindow.trim(),
        metadata: {
          section: CVSection.SUMMARY,
          importance: 1.0,
          tags: ['sliding-window'],
          source: 'summary'
        },
        tokenCount: this.estimateTokenCount(currentWindow),
        chunkIndex: chunkIndex++
      });
    }
    
    return chunks;
  }
  
  /**
   * Split large paragraph into smaller chunks
   */
  private static splitLargeParagraph(paragraph: string, maxTokens: number): string[] {
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const proposedChunk = currentChunk ? `${currentChunk}. ${sentence}` : sentence;
      
      if (this.estimateTokenCount(proposedChunk) <= maxTokens) {
        currentChunk = proposedChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }
    
    return chunks;
  }
  
  /**
   * Estimate token count for text (rough approximation)
   */
  static estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}