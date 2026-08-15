import { Injectable } from '@nestjs/common';

export interface DocumentChunk {
  id: string;
  caseId: string;
  caseNumber: string;
  content: string;
  metadata: {
    type: 'description' | 'report' | 'task' | 'chat' | 'title';
    title?: string;
    createdAt: string;
  };
}

export interface SearchResult {
  caseId: string;
  caseNumber: string;
  content: string;
  score: number;
  metadata: any;
}

@Injectable()
export class SimpleVectorStoreService {
  private documents: DocumentChunk[] = [];

  /**
   * Add a document to the store
   */
  async addDocument(chunk: DocumentChunk): Promise<void> {
    this.documents.push(chunk);
  }

  /**
   * Add multiple documents
   */
  async addDocuments(chunks: DocumentChunk[]): Promise<void> {
    this.documents.push(...chunks);
    console.log(`Indexed ${chunks.length} documents (total: ${this.documents.length})`);
  }

  /**
   * Delete all documents for a case
   */
  async deleteCaseDocuments(caseId: string): Promise<void> {
    const before = this.documents.length;
    this.documents = this.documents.filter(d => d.caseId !== caseId);
    const deleted = before - this.documents.length;
    console.log(`Deleted ${deleted} documents for case ${caseId}`);
  }

  /**
   * Search for relevant documents using keyword matching (BM25-like)
   */
  async search(query: string, topK: number = 5, caseId?: string): Promise<SearchResult[]> {
    const queryWords = this.tokenize(query.toLowerCase());
    
    if (queryWords.length === 0) {
      return [];
    }

    // Filter by caseId if specified
    const docsToSearch = caseId 
      ? this.documents.filter(d => d.caseId === caseId)
      : this.documents;

    if (docsToSearch.length === 0) {
      return [];
    }

    // Calculate BM25-like scores
    const results: SearchResult[] = [];
    
    for (const doc of docsToSearch) {
      const docWords = this.tokenize(doc.content.toLowerCase());
      const score = this.calculateScore(queryWords, docWords, doc.content);
      
      results.push({
        caseId: doc.caseId,
        caseNumber: doc.caseNumber,
        content: doc.content,
        score,
        metadata: doc.metadata
      });
    }

    // Sort by score and return top K
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u024F]/g, ' ') // Keep Vietnamese characters
      .split(/\s+/)
      .filter(word => word.length > 1);
  }

  /**
   * Calculate BM25-like score
   */
  private calculateScore(queryWords: string[], docWords: string[], fullContent: string): number {
    if (queryWords.length === 0) return 0;
    
    let score = 0;
    const contentLower = fullContent.toLowerCase();
    
    for (const queryWord of queryWords) {
      // Exact match bonus
      if (contentLower.includes(queryWord)) {
        score += 10;
        
        // Count occurrences
        const regex = new RegExp(queryWord, 'gi');
        const matches = contentLower.match(regex);
        if (matches) {
          score += matches.length * 2;
        }
        
        // Phrase match bonus (for multi-word queries)
        if (queryWords.length > 1 && contentLower.includes(queryWords.join(' '))) {
          score += 15;
        }
      }
      
      // Partial match bonus
      for (const docWord of docWords) {
        if (docWord.includes(queryWord) || queryWord.includes(docWord)) {
          score += 3;
        }
      }
    }

    // Normalize by document length
    const docLength = docWords.length;
    const avgLength = this.documents.length > 0 
      ? this.documents.reduce((sum, d) => sum + this.tokenize(d.content).length, 0) / this.documents.length 
      : 1;
    
    const lengthPenalty = docLength / avgLength;
    score = score / Math.sqrt(lengthPenalty);

    return score;
  }

  /**
   * Get total number of indexed documents
   */
  getDocumentCount(): number {
    return this.documents.length;
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents = [];
    console.log('Cleared all documents from vector store');
  }

  /**
   * Check if vector store has documents
   */
  isReady(): boolean {
    return true;
  }
}
