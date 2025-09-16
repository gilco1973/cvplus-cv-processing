/**
 * Chunking Utilities
 * Handles text chunking for CV content processing
 */

export interface ChunkResult {
  chunks: string[];
  metadata: ChunkMetadata[];
  content?: string;
  tokenCount?: number;
}

export interface ChunkMetadata {
  index: number;
  startPosition: number;
  endPosition: number;
  wordCount: number;
  type: 'header' | 'paragraph' | 'list' | 'other';
}

export class ChunkingUtils {
  static chunk(content: string, maxChunkSize: number = 1000, overlap: number = 100): ChunkResult {
    const chunks: string[] = [];
    const metadata: ChunkMetadata[] = [];
    
    const words = content.split(/\s+/);
    const wordsPerChunk = Math.floor(maxChunkSize / 6); // Approximate words per chunk
    const overlapWords = Math.floor(overlap / 6);
    
    for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const chunk = chunkWords.join(' ');
      
      chunks.push(chunk);
      metadata.push({
        index: chunks.length - 1,
        startPosition: i,
        endPosition: i + chunkWords.length,
        wordCount: chunkWords.length,
        type: this.detectChunkType(chunk)
      });
      
      if (i + wordsPerChunk >= words.length) break;
    }
    
    return { chunks, metadata };
  }
  
  static chunkBySection(content: string): ChunkResult {
    const sections = content.split(/\n\s*\n/);
    const chunks: string[] = [];
    const metadata: ChunkMetadata[] = [];
    
    let position = 0;
    
    sections.forEach((section, index) => {
      const trimmedSection = section.trim();
      if (trimmedSection) {
        chunks.push(trimmedSection);
        metadata.push({
          index,
          startPosition: position,
          endPosition: position + trimmedSection.length,
          wordCount: trimmedSection.split(/\s+/).length,
          type: this.detectChunkType(trimmedSection)
        });
      }
      position += section.length + 2; // +2 for the double newline
    });
    
    return { chunks, metadata };
  }
  
  private static detectChunkType(chunk: string): ChunkMetadata['type'] {
    const trimmed = chunk.trim();
    
    // Check if it's a header (short line, often in caps or title case)
    if (trimmed.length < 100 && trimmed.split(/\s+/).length <= 10) {
      if (trimmed === trimmed.toUpperCase() || 
          trimmed.split(' ').every(word => word.charAt(0) === word.charAt(0).toUpperCase())) {
        return 'header';
      }
    }
    
    // Check if it's a list (starts with bullet points or numbers)
    if (/^[\s]*[-•*]\s/.test(trimmed) || /^[\s]*\d+\.\s/.test(trimmed)) {
      return 'list';
    }
    
    // Check if it contains multiple list items
    if ((trimmed.match(/\n[\s]*[-•*]\s/g) || []).length > 1 ||
        (trimmed.match(/\n[\s]*\d+\.\s/g) || []).length > 1) {
      return 'list';
    }
    
    // Default to paragraph
    return 'paragraph';
  }
  
  static semanticChunking(content: string, maxChunkSize: number = 1000): ChunkResult {
    // Semantic chunking based on sentence and paragraph boundaries
    const sentences = content.split(/[.!?]+\s+/);
    const chunks: string[] = [];
    const metadata: ChunkMetadata[] = [];
    
    let currentChunk = '';
    let startPosition = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk);
        metadata.push({
          index: chunks.length - 1,
          startPosition,
          endPosition: startPosition + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).length,
          type: 'paragraph'
        });
        
        startPosition += currentChunk.length;
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
      metadata.push({
        index: chunks.length - 1,
        startPosition,
        endPosition: startPosition + currentChunk.length,
        wordCount: currentChunk.split(/\s+/).length,
        type: 'paragraph'
      });
    }
    
    return { chunks, metadata };
  }
  
  static fixedSizeChunking(content: string, chunkSize: number = 1000): ChunkResult {
    return this.chunk(content, chunkSize, 0);
  }
  
  static slidingWindowChunking(content: string, windowSize: number = 1000, step: number = 500): ChunkResult {
    return this.chunk(content, windowSize, windowSize - step);
  }
}