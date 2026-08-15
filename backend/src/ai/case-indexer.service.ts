import { Injectable, OnModuleInit } from '@nestjs/common';
import { SimpleVectorStoreService, DocumentChunk } from './simple-vector-store.service';
import { CasesService } from '../cases/cases.service';

@Injectable()
export class CaseIndexerService implements OnModuleInit {
  constructor(
    private vectorStoreService: SimpleVectorStoreService,
    private casesService: CasesService,
  ) {}

  /**
   * Index all cases on module initialization
   */
  async onModuleInit() {
    // Wait a bit for services to initialize
    setTimeout(async () => {
      await this.indexAllCases();
    }, 2000);
  }

  /**
   * Index a single case
   */
  async indexCase(caseData: any): Promise<void> {
    const chunks: DocumentChunk[] = [];
    const createdAt = new Date(caseData.createdAt || Date.now()).toISOString();

    // 1. Index case description
    if (caseData.description) {
      chunks.push({
        id: `${caseData.id}-desc`,
        caseId: caseData.id,
        caseNumber: caseData.caseNumber,
        content: `Vu an ${caseData.caseNumber}: ${caseData.title}. ${caseData.description}`,
        metadata: {
          type: 'description',
          title: caseData.title,
          createdAt
        }
      });
    }

    // 2. Index case title
    if (caseData.title) {
      chunks.push({
        id: `${caseData.id}-title`,
        caseId: caseData.id,
        caseNumber: caseData.caseNumber,
        content: `Tieu de vu an: ${caseData.title}. Ma vu: ${caseData.caseNumber}`,
        metadata: {
          type: 'title',
          title: caseData.title,
          createdAt
        }
      });
    }

    // 3. Index report if exists
    if (caseData.report) {
      chunks.push({
        id: `${caseData.id}-report`,
        caseId: caseData.id,
        caseNumber: caseData.caseNumber,
        content: `Bao cao vu an ${caseData.caseNumber}: ${caseData.report}`,
        metadata: {
          type: 'report',
          title: caseData.title,
          createdAt: caseData.reportSubmittedAt || createdAt
        }
      });
    }

    // 4. Index assignments and tasks
    if (caseData.assignments && caseData.assignments.length > 0) {
      for (const assignment of caseData.assignments) {
        if (assignment.tasks && assignment.tasks.length > 0) {
          const taskList = assignment.tasks.map((t: any) => t.title).join(', ');
          chunks.push({
            id: `${caseData.id}-tasks-${assignment.userId}`,
            caseId: caseData.id,
            caseNumber: caseData.caseNumber,
            content: `Nhiem vu vu an ${caseData.caseNumber}: ${taskList}`,
            metadata: {
              type: 'task',
              title: caseData.title,
              createdAt
            }
          });
        }
      }
    }

    // Add all chunks to vector store
    if (chunks.length > 0) {
      await this.vectorStoreService.addDocuments(chunks);
      console.log(`Indexed ${chunks.length} chunks for case ${caseData.caseNumber}`);
    }
  }

  /**
   * Index all existing cases
   */
  async indexAllCases(): Promise<{ indexed: number; errors: number }> {
    let indexed = 0;
    let errors = 0;

    try {
      const cases = this.casesService.findAll();
      console.log(`Starting to index ${cases.length} cases...`);

      for (const c of cases) {
        try {
          await this.indexCase(c);
          indexed++;
        } catch (error) {
          console.error(`Error indexing case ${c.caseNumber}:`, error);
          errors++;
        }
      }

      console.log(`Indexing complete: ${indexed} cases indexed, ${errors} errors`);
      return { indexed, errors };
    } catch (error) {
      console.error('Error in indexAllCases:', error);
      return { indexed, errors: errors + 1 };
    }
  }

  /**
   * Re-index a case (delete old and add new)
   */
  async reindexCase(caseId: string): Promise<void> {
    await this.vectorStoreService.deleteCaseDocuments(caseId);
    const caseData = this.casesService.findById(caseId);
    if (caseData) {
      await this.indexCase(caseData);
    }
  }

  /**
   * Get indexing statistics
   */
  async getStats(): Promise<{ documentCount: number; caseCount: number; isReady: boolean }> {
    const documentCount = this.vectorStoreService.getDocumentCount();
    const caseCount = this.casesService.findAll().length;
    const isReady = this.vectorStoreService.isReady();

    return { documentCount, caseCount, isReady };
  }
}
