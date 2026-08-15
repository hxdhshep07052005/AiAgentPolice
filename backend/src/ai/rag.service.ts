import { Injectable } from '@nestjs/common';
import { SimpleVectorStoreService, SearchResult } from './simple-vector-store.service';

export interface CaseContext {
  caseInfo: {
    id: string;
    caseNumber: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
  };
  tasks: Array<{
    userId: string;
    userName: string;
    templateName: string;
    checklist: Array<{ title: string; completed: boolean; completedAt?: string }>;
    progress: number;
  }>;
  members: Array<{ id: string; name: string; role: string; title: string }>;
  recentMessages?: Array<{ sender: string; content: string; timestamp: string }>;
}

@Injectable()
export class RagService {
  constructor(
    private vectorStoreService: SimpleVectorStoreService,
  ) {}

  /**
   * Get relevant context from vector store for a query
   */
  async getRelevantContext(
    query: string, 
    caseContext?: CaseContext,
    topK: number = 5
  ): Promise<string> {
    try {
      // Search vector store for relevant documents
      const searchResults = await this.vectorStoreService.search(
        query, 
        topK,
        caseContext?.caseInfo?.id
      );

      if (searchResults.length === 0) {
        return '';
      }

      // Format retrieved context
      const contextParts = searchResults.map(result => {
        const typeLabel = this.getTypeLabel(result.metadata?.type);
        return `[${result.caseNumber}] ${typeLabel}: ${result.content}`;
      });

      return contextParts.join('\n\n');
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return '';
    }
  }

  /**
   * Get human-readable label for document type
   */
  private getTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      'description': 'Mo ta vu an',
      'report': 'Bao cao',
      'task': 'Nhiem vu',
      'chat': 'Tin nhan',
      'title': 'Tieu de'
    };
    return labels[type || ''] || 'Thong tin';
  }

  /**
   * Build enhanced prompt with RAG context
   */
  buildRagPrompt(
    question: string,
    caseContext: CaseContext,
    retrievedContext: string
  ): { systemPrompt: string; userPrompt: string } {
    // Format case info for prompt
    const caseInfoText = `
=== THONG TIN VU AN HIEN TAI ===
Ma vu: ${caseContext.caseInfo.caseNumber}
Tieu de: ${caseContext.caseInfo.title}
Mo ta: ${caseContext.caseInfo.description}
Trang thai: ${this.translateStatus(caseContext.caseInfo.status)}
Do uu tien: ${this.translatePriority(caseContext.caseInfo.priority)}
Ngay tao: ${caseContext.caseInfo.createdAt}
`;

    const tasksText = caseContext.tasks.length > 0 ? `
=== NHIEM VU DA PHAN CONG ===
${caseContext.tasks.map(t => `
Nguoi thuc hien: ${t.userName}
Nhiem vu: ${t.templateName}
Tien do: ${t.progress}%
Chi tiet checklist:
${t.checklist.map(c => `  - ${c.title}: ${c.completed ? 'Da hoan thanh' : 'Chua hoan thanh'}`).join('\n')}
`).join('\n')}
` : '\n=== Chua co nhiem vu nao duoc phan cong ===';

    const membersText = caseContext.members.length > 0 ? `
=== THANH VIEN VU AN ===
${caseContext.members.map(m => `- ${m.name} (${m.title})`).join('\n')}
` : '';

    const recentMessagesText = caseContext.recentMessages?.length 
      ? `\n=== TIN NHAN GAN DAY ===\n${caseContext.recentMessages.map(m => `[${m.timestamp}] ${m.sender}: ${m.content}`).join('\n')}`
      : '';

    // Retrieved context from vector store
    const retrievedText = retrievedContext ? `
=== THONG TIN LIEN QUAN TU CSDL (RAG) ===
${retrievedContext}

Luu y: Thong tin tren duoc lay tu co so du lieu. Su dung de tham khao nhung quyet dinh cuoi cung van thuoc ve can bo co tham quyen.
` : '';

    const systemPrompt = `Ban la tro ly AI cho he thong quan ly kham nghiem hien truong.
Nguyen tac: AI CHI HO TRO, khong the thay the quyet dinh cua con nguoi.

Ban co the tra loi cac cau hoi ve:
- Tien trinh vu an (dang o giai doan nao, ai dang lam gi)
- Checklist da hoan thanh/chua hoan thanh
- Thong tin cac thanh vien trong vu an
- Goi y cac buoc tiep theo hop ly
- Tom tat noi dung vu an

Khong tra loi: cau hoi ngoai pham vi vu an, yeu cau dua ra ket luan thay con nguoi.`;

    const userPrompt = `${caseInfoText}${tasksText}${membersText}${recentMessagesText}${retrievedText}

Cau hoi: ${question}

Hay tra loi dua tren thong tin tren:`;

    return { systemPrompt, userPrompt };
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      'moi': 'Moi tao',
      'dang-xu-ly': 'Dang xu ly',
      'hoan-thanh': 'Hoan thanh',
      'qua-han': 'Qua han'
    };
    return map[status] || status;
  }

  private translatePriority(priority: string): string {
    const map: Record<string, string> = {
      'high': 'Cao',
      'medium': 'Trung binh',
      'low': 'Thap'
    };
    return map[priority] || priority;
  }
}
