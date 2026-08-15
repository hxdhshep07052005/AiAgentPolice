import { Injectable } from '@nestjs/common';
import { RagService } from './rag.service';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen3.6:35b-a3b';
const MODEL_DISPLAY_NAME = "Phần mềm Quản lý Khám nghiệm";

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

interface CaseContext {
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
export class AiService {
  constructor(private ragService: RagService) {}

  async checkStatus(): Promise<{ status: string; models?: any[]; error?: string }> {
    try {
      const response = await fetch(`${OLLAMA_HOST}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'online',
          models: data.models || [],
        };
      }
      return { status: 'offline', error: 'Ollama not responding' };
    } catch (error: any) {
      return { status: 'offline', error: error.message };
    }
  }

  async suggestAssignment(
    caseDescription: string,
    availableAgents: Array<{ id: string; name: string; title: string; role: string; skills: string[]; level: number }>
  ): Promise<any> {
    const systemPrompt = `Ban la tro ly AI ho tro lanh dao phan cong nhiem vu quan ly kham nghiem hien truong.
Nguyen tac: Can bo cap cao (level 1) giam sat va tong hop. Can bo cap trung (level 2) dieu tra chuyen sau. Can bo cap thap (level 3) truc tiep lam viec tai hien truong.

Phan cong phai dam bao:
1. Nguoi co ky nang phu hop voi nhiem vu
2. Theo nguyen tac AI CHI GOI Y, nguoi co tham quyen QUYET DINH
3. Moi nhiem vu can co it nhat 1 nguoi phu trach chinh

Tra loi theo format JSON voi cac truong: assignments (array), summary (string).
 Moi assignment gom: agentId, agentName, tasks (array), reasoning (string), priority (string).`;

    const agentList = availableAgents
      .map(a => `- ${a.id}: ${a.name} (${a.title}) - Level: ${a.level} - Ky nang: ${a.skills?.join(', ') || 'Tong quat'}`)
      .join('\n');

    try {
      const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          prompt: `Vu an: ${caseDescription}\n\nCan bo co san:\n${agentList}\n\nHay de xuat phan cong hop ly:`,
          system: systemPrompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 800 }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return this.parseAIResponse(data.response);
    } catch (error: any) {
      return this.getMockAssignment(availableAgents);
    }
  }

  async checkReport(reportContent: string, checklist: any[], userLevel: number = 3): Promise<any> {
    const levelNames: Record<number, string> = {
      1: 'Lanh dao/Cao cap',
      2: 'Truong phong/Trung cap', 
      3: 'Can bo/Co ban'
    };

    const systemPrompt = `Ban la chuyen gia kiem tra bao cao quan ly kham nghiem hien truong.
Nguoi nop bao cao co level: ${userLevel} (${levelNames[userLevel] || 'Can bo'}).

Kiem tra theo nguyen tac:
1. AI CHI GOI Y, khong quyet dinh
2. Moi canh bao phai chi ra du lieu cu the lam can cu
3. Khong quy ket ve nguoi, chi goi y can kiem tra

Voi level ${userLevel}, yeu cau khac nhau:
- Level 1: Bao cao tong hop, ket luan, de xuat hanh dong
- Level 2: Bao cao dieu tra chi tiet, noi dung, ket luan
- Level 3: Bao cao cong tac, cong viec da lam, vat chung thu thap

Tra loi theo format JSON voi cac truong: 
- isComplete (boolean): bao cao dat yeu cau khong
- score (number 0-100): diem hoan thien
- missingItems (array): cac muc con thieu
- levelNotes (string): ghi chu rieng cho level nguoi nop
- suggestions (array): goi y cai thien
- comments (string): nhan xet tong quan`;

    const checklistStr = checklist.map(c => 
      `- ${c.title}: ${c.completed ? 'Da hoan thanh' : 'Chua hoan thanh'}`
    ).join('\n');

    try {
      const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          prompt: `Bao cao:\n${reportContent}\n\nChecklist da hoan thanh:\n${checklistStr}\n\nHay kiem tra:`,
          system: systemPrompt,
          stream: false,
          options: { temperature: 0.5, num_predict: 800 }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return this.parseAIResponse(data.response);
    } catch (error: any) {
      return this.getMockReportReview(reportContent, checklist, userLevel);
    }
  }

  async queryCaseInfo(question: string, context: CaseContext): Promise<{ answer: string; suggestions?: string[] }> {
    try {
      // Get relevant context from vector store (RAG)
      const retrievedContext = await this.ragService.getRelevantContext(
        question,
        context,
        5
      );

      // Build enhanced prompt with RAG context
      const { systemPrompt, userPrompt } = this.ragService.buildRagPrompt(
        question,
        context,
        retrievedContext
      );

      console.log('Calling Ollama with prompt length:', userPrompt.length);

      const fetchResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          prompt: userPrompt,
          system: systemPrompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 1000 }
        })
      });

      if (!fetchResponse.ok) {
        throw new Error(`Ollama error: ${fetchResponse.status}`);
      }

      const data: OllamaResponse = await fetchResponse.json();
      
      if (!data.response) {
        console.error('Empty response from Ollama');
        return { answer: 'Xin loi, AI khong tra loi. Vui long thu lai.' };
      }
      
      return { answer: data.response };
    } catch (error: any) {
      console.error('Query case info error:', error);
      return this.getMockQueryResponse(question, context);
    }
  }

  async chat(message: string, history: any[] = [], caseContext?: any): Promise<{ message: string }> {
    // Build comprehensive system context including users
    const casesText = caseContext?.cases?.length > 0 
      ? `
=== DANH SACH TAT CA VU AN TRONG HE THONG ===
${caseContext.cases.map((c: any) => {
  const assignmentsInfo = c.assignments?.length > 0 
    ? c.assignments.map((a: any) => {
      const taskProgress = a.tasks?.filter((t: any) => t.completed).length || 0;
      const totalTasks = a.tasks?.length || 0;
      const progress = totalTasks > 0 ? Math.round((taskProgress / totalTasks) * 100) : 0;
      const completedTasks = a.tasks?.filter((t: any) => t.completed).map((t: any) => t.title).join(', ') || 'Chua co';
      const pendingTasks = a.tasks?.filter((t: any) => !t.completed).map((t: any) => t.title).join(', ') || 'Tat ca da xong';
      return `  - Nguoi phu trach: ${a.userId} | Tien do: ${progress}% | Da lam: ${completedTasks} | Con lai: ${pendingTasks}`;
    }).join('\n')
    : '  - Chua phan cong nhan su';
  
  return `- Ma vu: ${c.caseNumber}
  Tieu de: ${c.title}
  Trang thai: ${this.translateStatus(c.status)}
  Do uu tien: ${this.translatePriority(c.priority)}
  Ngay tao: ${c.createdAt}
  Phan cong nhan su:
${assignmentsInfo}
  Bao cao: ${c.report ? 'Da co bao cao' : 'Chua co bao cao'}`;
}).join('\n\n')}
`
      : '\n=== Chua co vu an nao trong he thong ===';

    const usersText = caseContext?.users?.length > 0
      ? `
=== DANH SACH CAN BO TRONG HE THONG ===
${caseContext.users.map((u: any) => {
  // Find which cases this user is assigned to
  const userCases = caseContext.cases?.filter((c: any) => 
    c.assignments?.some((a: any) => a.userId === u.id)
  ) || [];
  
  const caseAssignments = userCases.map((c: any) => {
    const assignment = c.assignments.find((a: any) => a.userId === u.id);
    const completedCount = assignment?.tasks?.filter((t: any) => t.completed).length || 0;
    const totalCount = assignment?.tasks?.length || 0;
    return `${c.caseNumber} (${completedCount}/${totalCount} task)`;
  }).join(', ') || 'Chua co viec';
  
  return `- ${u.name} (${u.username})
  Chuc vu: ${u.title}
  Phong ban: ${u.department}
  Cap bac: Level ${u.level} (${this.translateLevel(u.level)})
  Ky nang: ${u.skills?.join(', ') || 'Tong quat'}
  Trang thai: ${u.isActive ? 'Dang hoat dong' : 'Khong hoat dong'}
  Duoc phan cong: ${caseAssignments}`;
}).join('\n\n')}
`
      : '\n=== Chua co thong tin can bo ===';

    const selectedCaseText = caseContext?.selectedCaseId
      ? (() => {
          const selectedCase = caseContext.cases?.find((c: any) => c.id === caseContext.selectedCaseId);
          if (!selectedCase) return '';
          
          const members = selectedCase.assignments?.map((a: any) => {
            const user = caseContext.users?.find((u: any) => u.id === a.userId);
            const taskProgress = a.tasks?.filter((t: any) => t.completed).length || 0;
            const totalTasks = a.tasks?.length || 0;
            return `- ${user?.name || a.userId}: ${taskProgress}/${totalTasks} task hoan thanh`;
          }).join('\n') || 'Chua co thanh vien';
          
          return `
=== VU AN DUOC CHON ===
Ma vu: ${selectedCase.caseNumber}
Tieu de: ${selectedCase.title}
Mo ta: ${selectedCase.description}
Trang thai: ${this.translateStatus(selectedCase.status)}
Do uu tien: ${this.translatePriority(selectedCase.priority)}
Thanh vien va tien do:
${members}
`;
        })()
      : '';

    const systemPrompt = `Ban la tro ly AI cho he thong quan ly kham nghiem hien truong.
Ban co THE TRUY CAP DAY DU thong tin ve:
1. Tat ca cac vu an trong he thong (trang thai, phan cong, tien do)
2. Tat ca can bo dieu tra (ten, chuc vu, phong ban, ky nang, viec dang lam)
3. Thong tin chi tiet ve vu an duoc chon (neu co)

Nguyen tac hoat dong:
- AI CHI HO TRO, khong the thay the quyet dinh cua con nguoi
- Moi quyet dinh dieu tra, phan cong la cua CAN BO CO THAM QUYEN
- Tra loi nhanh, chinh xac ve tinh trang nhan su va tien do cong viec
- Khi hoi ve "ai dang lam gi", "tien do nao", can chi ro tung nguoi

Ban co the tra loi cac loai cau hoi:
- "Danh sach can bo hien co"
- "Can bo nao dang lam viec nao"
- "Tien do vu an X den dau"
- "Phan cong nhan su cho vu an Y"
- "Ai chua lam xong task"
- "Cho biet trang thai tat ca vu an"
- "Nhung can bo nao dang ranh"

${casesText}
${usersText}
${selectedCaseText}
`;



    try {
      // Get relevant context from RAG
      let contextInfo = '';
      if (caseContext?.cases) {
        const relevantDocs = await this.ragService.getRelevantContext(message, undefined, 3);
        if (relevantDocs) {
          contextInfo = `\n\n=== THONG TIN LIEN QUAN TU CSDL ===\n${relevantDocs}\n`;
        }
      }

      // Build user message with context
      const userMessageWithContext = contextInfo 
        ? `${message}${contextInfo}\n\nHay tra loi cau hoi tren dua tren thong tin vu an.` 
        : message;

      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: userMessageWithContext }
          ],
          stream: false,
          options: { temperature: 0.7 }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      return { message: data.message?.content || '' };
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Fallback mock response with case context
      const mockResponse = this.getMockChatResponse(message, caseContext);
      return { message: mockResponse };
    }
  }

  private getMockChatResponse(message: string, context?: any): string {
    const msg = message.toLowerCase();
    
    if (msg.includes('can bo') || msg.includes('danh sach') || msg.includes('nguoi')) {
      if (context?.users?.length > 0) {
        const userList = context.users.map((u: any) => `- ${u.name} (${u.title}) - ${u.department}`).join('\n');
        return `Danh sach can bo trong he thong:\n${userList}\n\nDe co them thong tin chi tiet, vui long lien he voi can bo quan ly.`;
      }
      return 'Hien chua co thong tin can bo trong he thong.';
    }
    
    if (msg.includes('vu an') || msg.includes('case')) {
      if (context?.cases?.length > 0) {
        const caseList = context.cases.map((c: any) => 
          `- ${c.caseNumber}: ${c.title} (${this.translateStatus(c.status)})`
        ).join('\n');
        return `Danh sach vu an:\n${caseList}`;
      }
      return 'Hien chua co vu an nao trong he thong.';
    }
    
    if (msg.includes('tien do') || msg.includes('progress')) {
      return 'De xem tien do cu the, vui long chon mot vu an cu the tu danh sach va hoi chi tiet hon.';
    }
    
    if (msg.includes('ai') || msg.includes('help')) {
      return `Toi la ${MODEL_DISPLAY_NAME}, ho tro quan ly kham nghiem.\n\nBan co the hoi:\n- Danh sach can bo\n- Tinh trang vu an\n- Tien do cong viec\n- Thong tin ve mot vu an cu the`;
    }
    
    return `Xin chao! Toi la ${MODEL_DISPLAY_NAME}.\n\nToi co the giup ban tra loi ve:\n- Thong tin can bo trong he thong\n- Tinh trang cac vu an\n- Tien do cong viec\n- Quy trinh dieu tra\n\nHay dat cau hoi cu the de toi co the ho tro tot hon.`;
  }

  private parseAIResponse(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: text };
    } catch {
      return { raw: text };
    }
  }

  private getMockAssignment(agents: any[]): any {
    const canBoAgents = agents.filter(a => a.skills?.includes('kham-nghiem'));
    return {
      assignments: canBoAgents.slice(0, 2).map(agent => ({
        agentId: agent.id,
        agentName: agent.name,
        tasks: agent.skills?.includes('tra-camera') 
          ? [{ id: 'tra-cuu-camera', name: 'Tra cuu camera' }] 
          : [{ id: 'kham-nghiem-hien-truong', name: 'Kham nghiem hien truong' }],
        reasoning: `Dua tren ky nang: ${agent.skills?.join(', ')}`,
        priority: 'high'
      })),
      summary: 'De xuat phan cong theo ky nang cua tung can bo. Lanh dao giam sat, can bo truc tiep lam nhiem vu.'
    };
  }

  private getMockReportReview(report: string, checklist: any[], userLevel: number): any {
    const wordCount = report.split(/\s+/).length;
    const completedCount = checklist.filter(c => c.completed).length;
    const checklistScore = (completedCount / Math.max(checklist.length, 1)) * 60;
    const contentScore = Math.min(40, (wordCount / 100) * 40);
    const score = Math.round(checklistScore + contentScore);

    const levelNotes: Record<number, string> = {
      1: 'Bao cao cap lanh dao can co tong hop, ket luan ro rang va de xuat hanh dong cu the.',
      2: 'Bao cao cap trung can chi tiet ve noi dung dieu tra va phan tich chung cu.',
      3: 'Bao cao cap co ban can mo ta ro cong viec da lam va vat chung da thu thap.'
    };

    return {
      isComplete: score >= 70,
      score,
      missingItems: score < 70 ? ['Bao cao can chi tiet hon ve cac buoc da thuc hien'] : [],
      levelNotes: levelNotes[userLevel] || levelNotes[3],
      suggestions: ['Them thong tin thoi gian, dia diem cu the', 'Mo ta ro cac buoc da thuc hien', 'Liet ke day du vat chung'],
      comments: score >= 70 ? 'Bao cao dat yeu cau cho level ' + userLevel : 'Can bo sung them thong tin de hoan thien bao cao'
    };
  }

  private getMockQueryResponse(question: string, context: CaseContext): any {
    const q = question.toLowerCase();
    
    if (q.includes('tien trinh') || q.includes('progress')) {
      const avgProgress = context.tasks.length > 0 
        ? Math.round(context.tasks.reduce((sum, t) => sum + t.progress, 0) / context.tasks.length)
        : 0;
      return {
        answer: `Vu an dang o trang thai "${this.translateStatus(context.caseInfo.status)}". Tien do chung: ${avgProgress}%. ${context.tasks.length} nhiem vu da duoc phan cong.`
      };
    }
    
    if (q.includes('ai') || q.includes('dang lam')) {
      const activeTasks = context.tasks.filter(t => t.progress < 100);
      if (activeTasks.length === 0) {
        return { answer: 'Tat ca nhiem vu da hoan thanh. Co the tien hanh tong hop bao cao.' };
      }
      return {
        answer: `Dang co ${activeTasks.length} nhiem vu chua hoan thanh:\n${activeTasks.map(t => `- ${t.userName}: ${t.templateName} (${t.progress}%)`).join('\n')}`
      };
    }

    if (q.includes('thieu') || q.includes('chua')) {
      const incomplete = context.tasks.flatMap(t => 
        t.checklist.filter(c => !c.completed).map(c => ({ user: t.userName, task: c.title }))
      );
      if (incomplete.length === 0) {
        return { answer: 'Tat ca checklist da hoan thanh.' };
      }
      return {
        answer: `Con ${incomplete.length} muc chua hoan thanh:\n${incomplete.map(i => `- ${i.user}: ${i.task}`).join('\n')}`
      };
    }

    return {
      answer: `Toi co the giup ban ve tien trinh vu an, tinh trang nhiem vu, va thong tin cac thanh vien. Ban muon hoi gi?`
    };
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

  private translateRole(role: string): string {
    const map: Record<string, string> = {
      'lanh-dao': 'Lanh dao',
      'can-bo': 'Can bo',
      'quan-tri': 'Quan tri'
    };
    return map[role] || role;
  }

  private translateLevel(level: number): string {
    const map: Record<number, string> = {
      1: 'Lanh dao/Cao cap',
      2: 'Truong phong/Trung cap',
      3: 'Can bo/Co ban'
    };
    return map[level] || 'Khong xac dinh';
  }
}
