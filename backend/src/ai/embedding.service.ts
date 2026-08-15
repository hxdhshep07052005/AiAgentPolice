import { Injectable } from '@nestjs/common';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

@Injectable()
export class EmbeddingService {
  /**
   * Generate embedding for a single text
   */
  async embedText(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          prompt: text
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama embedding error: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Embedding error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.embedText(text);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }

  /**
   * Check if embedding service is available
   */
  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_HOST}/api/tags`);
      if (!response.ok) return false;
      
      const data = await response.json();
      const models = data.models || [];
      const hasEmbeddingModel = models.some(
        (m: any) => m.name.includes('nomic') || m.name.includes('embed')
      );
      
      // If no embedding model, we can still use the chat model for embeddings
      return models.length > 0;
    } catch {
      return false;
    }
  }
}
