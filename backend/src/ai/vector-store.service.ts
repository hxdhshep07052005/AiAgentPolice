import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { EmbeddingService } from './embedding.service';

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
export class VectorStoreService implements OnModuleInit {
  private client: ChromaClient;
  private collection: Collection;
  private isInitialized = false;

  constructor(private embeddingService: EmbeddingService) {}

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    try {
      // Use ephemeral Chroma (in-memory) for simplicity
      // For production, use: new ChromaClient({ path: 'http://localhost:8000' })
      this.client = new ChromaClient();
      
      // Create or get the cases collection
      try {
        this.collection = await this.client.getOrCreateCollection({
          name: 'case_documents',
          metadata: { description: 'Investigation case documents for RAG' }
        });
      } catch (error) {
        // Collection might already exist
        console.log('Collection might already exist:', error);
        this.collection = await this.client.getCollection({
          name: 'case_documents'
        });
      }
      
      this.isInitialized = true;
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if vector store is ready
   */
  isReady(): boolean {
    return this.isInitialized && !!this.collection;
  }

  /**
   * Index a document chunk
   */
  async addDocument(chunk: DocumentChunk): Promise<void> {
    if (!this.isReady()) {
      console.warn('Vector store not ready, skipping indexing');
      return;
    }

    try {
      const embedding = await this.embeddingService.embedText(chunk.content);
      
      await this.collection.add({
        ids: [chunk.id],
        embeddings: [embedding],
        documents: [chunk.content],
        metadatas: [{
          caseId: chunk.caseId,
          caseNumber: chunk.caseNumber,
          type: chunk.metadata.type,
          title: chunk.metadata.title || '',
          createdAt: chunk.metadata.createdAt
        }]
      });
    } catch (error) {
      console.error('Error adding document to vector store:', error);
    }
  }

  /**
   * Index multiple documents at once
   */
  async addDocuments(chunks: DocumentChunk[]): Promise<void> {
    if (!this.isReady()) {
      console.warn('Vector store not ready, skipping indexing');
      return;
    }

    try {
      // Generate embeddings for all chunks
      const contents = chunks.map(c => c.content);
      const embeddings = await this.embeddingService.embedTexts(contents);
      
      await this.collection.add({
        ids: chunks.map(c => c.id),
        embeddings: embeddings,
        documents: contents,
        metadatas: chunks.map(c => ({
          caseId: c.caseId,
          caseNumber: c.caseNumber,
          type: c.metadata.type,
          title: c.metadata.title || '',
          createdAt: c.metadata.createdAt
        }))
      });
      
      console.log(`Indexed ${chunks.length} documents`);
    } catch (error) {
      console.error('Error adding documents batch:', error);
    }
  }

  /**
   * Delete all documents for a case
   */
  async deleteCaseDocuments(caseId: string): Promise<void> {
    if (!this.isReady()) return;

    try {
      // Get all documents for this case
      const result = await this.collection.get({
        where: { caseId: caseId }
      });
      
      if (result.ids.length > 0) {
        await this.collection.delete({ ids: result.ids });
        console.log(`Deleted ${result.ids.length} documents for case ${caseId}`);
      }
    } catch (error) {
      console.error('Error deleting case documents:', error);
    }
  }

  /**
   * Search for relevant documents
   */
  async search(query: string, topK: number = 5, caseId?: string): Promise<SearchResult[]> {
    if (!this.isReady()) {
      console.warn('Vector store not ready, returning empty results');
      return [];
    }

    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.embedText(query);
      
      // Build where clause if caseId is specified
      const where = caseId ? { caseId: caseId } : undefined;
      
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        where: where,
        include: ['documents', 'metadatas', 'distances']
      });

      // Format results
      const searchResults: SearchResult[] = [];
      
      if (results.documents && results.documents[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          const metadata = (results.metadatas?.[0]?.[i] as Record<string, any>) || {};
          searchResults.push({
            caseId: String(metadata.caseId || ''),
            caseNumber: String(metadata.caseNumber || ''),
            content: results.documents[0][i] || '',
            score: 1 - (results.distances?.[0]?.[i] || 0), // Convert distance to similarity
            metadata: metadata
          });
        }
      }
      
      return searchResults;
    } catch (error) {
      console.error('Error searching vector store:', error);
      return [];
    }
  }

  /**
   * Get total number of indexed documents
   */
  async getDocumentCount(): Promise<number> {
    if (!this.isReady()) return 0;

    try {
      const result = await this.collection.count();
      return result;
    } catch {
      return 0;
    }
  }

  /**
   * Clear all documents (for testing)
   */
  async clear(): Promise<void> {
    if (!this.isReady()) return;

    try {
      await this.collection.delete({ where: {} });
      console.log('Cleared all documents from vector store');
    } catch (error) {
      console.error('Error clearing vector store:', error);
    }
  }
}
