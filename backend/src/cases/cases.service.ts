import { Injectable } from '@nestjs/common';
import { Case, Assignment, TaskItem, CaseMember, CaseTemplate } from './case.entity';
import { v4 as uuid } from 'uuid';
import { SEED_CASES } from '../seed';
import { jsonStorageService } from '../storage/json-storage.service';

// Report templates theo cấp bậc
export interface ReportTemplate {
  level: number;
  title: string;
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  fields: string[];
}

export const REPORT_TEMPLATES: Record<number, ReportTemplate> = {
  1: { // Cao cấp - Lãnh đạo
    level: 1,
    title: 'BÁO CÁO TỔNG HỢP',
    sections: [
      { id: 'tong-quan', title: 'I. TỔNG QUAN VỤ VIỆC', fields: ['tom-tat', 'danh-gia-chung', 'de-xuat-xu-ly'] },
      { id: 'ket-luan', title: 'II. KẾT LUẬN VÀ KIẾN NGHỊ', fields: ['ket-luan', 'kien-nghi'] }
    ]
  },
  2: { // Trung cấp - Trưởng phòng
    level: 2,
    title: 'BÁO CÁO ĐIỀU TRA',
    sections: [
      { id: 'thong-tin', title: 'I. THÔNG TIN CHUNG', fields: ['thoi-gian', 'dia-diem', 'nguoi-lien-quan'] },
      { id: 'noi-dung', title: 'II. NỘI DUNG ĐIỀU TRA', fields: ['mota-hinh-anh', 'chung-cu-thu-thap', 'phan-tich'] },
      { id: 'ket-luan', title: 'III. KẾT LUẬN', fields: ['ket-luan', 'de-xuat'] }
    ]
  },
  3: { // Cơ bản - Cán bộ
    level: 3,
    title: 'BÁO CÁO CÔNG TÁC',
    sections: [
      { id: 'thong-tin', title: 'I. THÔNG TIN', fields: ['thoi-gian', 'dia-diem', 'nguoi-thuc-hien'] },
      { id: 'cong-viec', title: 'II. CÔNG VIỆC ĐÃ THỰC HIỆN', fields: ['cac-buoc', 'ket-qua'] },
      { id: 'vat-chung', title: 'III. VẬT CHỨNG/DẤU VẾT', fields: ['vat-chung', 'dau-vet'] }
    ]
  }
};

// Task templates available in the system
export const TASK_TEMPLATES = [
  {
    id: 'kham-nghiem',
    name: 'Khám nghiệm hiện trường',
    description: 'Khám nghiệm và thu thập dấu vết tại hiện trường',
    requiredSkills: ['kham-nghiem', 'chup-anh', 'thu-thap-dau-vet'],
    checklist: [
      { id: uuid(), title: 'Bảo vệ hiện trường', description: 'Đảm bảo hiện trường không bị xáo trộn', priority: 'high', estimatedTime: '15 phút', required: true },
      { id: uuid(), title: 'Chụp ảnh toàn cảnh', description: 'Chụp ảnh tổng quan từ nhiều góc', priority: 'high', estimatedTime: '10 phút', required: true },
      { id: uuid(), title: 'Thu thập dấu vết', description: 'Thu thập vân tay, DNA và các dấu vết', priority: 'high', estimatedTime: '45 phút', required: true },
      { id: uuid(), title: 'Đo đạc sơ đồ', description: 'Vẽ sơ đồ vị trí các vật chứng', priority: 'medium', estimatedTime: '20 phút', required: true },
      { id: uuid(), title: 'Lập biên bản', description: 'Ghi chép và lập biên bản hiện trường', priority: 'high', estimatedTime: '20 phút', required: true },
      { id: uuid(), title: 'Bàn giao chứng cứ', description: 'Bàn giao vật chứng cho phòng giám định', priority: 'medium', estimatedTime: '15 phút', required: false },
    ],
  },
  {
    id: 'tra-camera',
    name: 'Trích xuất camera',
    description: 'Thu thập và phân tích hình ảnh từ camera',
    requiredSkills: ['tra-camera', 'phan-tich-anh'],
    checklist: [
      { id: uuid(), title: 'Xác định vị trí camera', description: 'Liệt kê camera trong bán kính 500m', priority: 'high', estimatedTime: '10 phút', required: true },
      { id: uuid(), title: 'Truy cập hệ thống', description: 'Liên hệ và truy cập hệ thống camera', priority: 'high', estimatedTime: '15 phút', required: true },
      { id: uuid(), title: 'Trích xuất footage', description: 'Sao chép footage trong khung giờ liên quan', priority: 'high', estimatedTime: '30 phút', required: true },
      { id: uuid(), title: 'Phân tích thời gian', description: 'Xác định đối tượng, thời gian, hành vi', priority: 'high', estimatedTime: '60 phút', required: true },
      { id: uuid(), title: 'Lưu bằng chứng', description: 'Lưu trữ footage có liên quan', priority: 'medium', estimatedTime: '20 phút', required: false },
    ],
  },
  {
    id: 'giam-dinh',
    name: 'Giám định chứng cứ',
    description: 'Giám định và phân tích các chứng cứ',
    requiredSkills: ['giam-dinh', 'phan-tich'],
    checklist: [
      { id: uuid(), title: 'Tiếp nhận chứng cứ', description: 'Kiểm tra và tiếp nhận chứng cứ từ hiện trường', priority: 'high', estimatedTime: '20 phút', required: true },
      { id: uuid(), title: 'Kiểm tra tính nguyên vẹn', description: 'Xác minh chứng cứ còn nguyên vẹn', priority: 'high', estimatedTime: '30 phút', required: true },
      { id: uuid(), title: 'Phân tích kỹ thuật', description: 'Phân tích chi tiết bằng thiết bị chuyên dụng', priority: 'high', estimatedTime: '60 phút', required: true },
      { id: uuid(), title: 'Lập báo cáo giám định', description: 'Viết báo cáo chi tiết kết quả giám định', priority: 'high', estimatedTime: '30 phút', required: true },
    ],
  },
  {
    id: 'tham-van',
    name: 'Thẩm vấn',
    description: 'Thẩm vấn và ghi nhận lời khai',
    requiredSkills: ['dieu-tra', 'thuam-van'],
    checklist: [
      { id: uuid(), title: 'Chuẩn bị câu hỏi', description: 'Nghiên cứu hồ sơ và chuẩn bị câu hỏi', priority: 'high', estimatedTime: '30 phút', required: true },
      { id: uuid(), title: 'Thẩm vấn', description: 'Tiến hành thẩm vấn theo quy trình', priority: 'high', estimatedTime: '60 phút', required: true },
      { id: uuid(), title: 'Ghi chép nội dung', description: 'Ghi chép đầy đủ nội dung lời khai', priority: 'high', estimatedTime: '30 phút', required: true },
      { id: uuid(), title: 'Lập biên bản', description: 'Hoàn thiện biên bản thẩm vấn', priority: 'medium', estimatedTime: '20 phút', required: true },
    ],
  },
  {
    id: 'phan-tich',
    name: 'Phân tích tổng hợp',
    description: 'Phân tích và tổng hợp thông tin vụ án',
    requiredSkills: ['phan-tich', 'quan-ly'],
    checklist: [
      { id: uuid(), title: 'Thu thập thông tin', description: 'Thu thập tất cả thông tin liên quan', priority: 'high', estimatedTime: '45 phút', required: true },
      { id: uuid(), title: 'Phân tích liên kết', description: 'Tìm mối liên hệ giữa các chứng cứ', priority: 'high', estimatedTime: '60 phút', required: true },
      { id: uuid(), title: 'Xây dựng timeline', description: 'Xây dựng timeline các sự kiện', priority: 'medium', estimatedTime: '30 phút', required: true },
      { id: uuid(), title: 'Báo cáo tổng hợp', description: 'Viết báo cáo phân tích tổng hợp', priority: 'high', estimatedTime: '45 phút', required: true },
    ],
  },
];

@Injectable()
export class CasesService {
  private cases: Case[] = [];
  private caseCounter = 11; // Start after seed data

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Try to load from JSON storage first
    if (jsonStorageService.hasData()) {
      const storedCases = jsonStorageService.getCases();
      if (storedCases && storedCases.length > 0) {
        this.cases = storedCases.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          reportSubmittedAt: c.reportSubmittedAt ? new Date(c.reportSubmittedAt) : undefined,
          assignments: c.assignments?.map((a: any) => ({
            ...a,
            assignedAt: new Date(a.assignedAt),
            tasks: a.tasks?.map((t: any) => ({
              ...t,
              completedAt: t.completedAt ? new Date(t.completedAt) : undefined
            })) || []
          })) || [],
          members: c.members?.map((m: any) => ({
            ...m,
            joinedAt: new Date(m.joinedAt)
          })) || [],
          caseTemplates: c.caseTemplates || []
        }));
        console.log(`✅ Loaded ${this.cases.length} cases from JSON storage`);
        return;
      }
    }
    
    // Load from seed data
    this.loadSeedData();
  }

  private saveData() {
    jsonStorageService.setCases(this.cases);
  }

  private loadSeedData() {
    this.cases = SEED_CASES.map(sc => ({
      id: sc.id,
      caseNumber: sc.caseNumber,
      title: sc.title,
      description: sc.description,
      priority: sc.priority,
      status: sc.status,
      createdBy: sc.createdBy,
      createdAt: new Date(sc.createdAt),
      updatedAt: new Date(sc.updatedAt),
      assignments: sc.assignments.map(sa => ({
        userId: sa.userId,
        userName: sa.userName || sa.userId,
        role: sa.role || 'thanh-vien',
        taskTemplateId: sa.taskTemplateId,
        taskTemplateName: sa.taskTemplateName || this.getTemplateName(sa.taskTemplateId),
        tasks: sa.tasks.map(st => ({
          id: st.id || uuid(),
          title: st.title,
          description: st.description || '',
          priority: st.priority,
          estimatedTime: st.estimatedTime || '30 phút',
          required: st.required ?? true,
          completed: st.completed ?? false,
          completedAt: st.completedAt ? new Date(st.completedAt) : undefined
        })),
        assignedAt: new Date(sa.assignedAt || sc.createdAt),
        assignedBy: sa.assignedBy || sc.createdBy
      })),
      channelId: sc.channelId,
      report: sc.report,
      reportSubmittedAt: sc.report ? new Date() : undefined,
      members: sc.members || [],
      caseTemplates: sc.caseTemplates || []
    }));
    this.saveData();
    console.log(`✅ Loaded ${this.cases.length} seed cases`);
  }

  private getTemplateName(templateId: string): string {
    const template = TASK_TEMPLATES.find(t => t.id === templateId);
    return template?.name || templateId;
  }

  // ============ Basic CRUD ============

  findAll(): Case[] {
    return this.cases;
  }

  findById(id: string): Case | undefined {
    return this.cases.find(c => c.id === id);
  }

  findByUser(userId: string): Case[] {
    return this.cases.filter(c => 
      c.createdBy === userId || 
      c.assignments.some(a => a.userId === userId)
    );
  }

  create(data: { title: string; description: string; priority: string; createdBy: string }): Case {
    const caseNumber = `VA-${new Date().getFullYear()}-${String(this.caseCounter++).padStart(3, '0')}`;
    
    const newCase: Case = {
      id: uuid(),
      caseNumber,
      title: data.title,
      description: data.description,
      priority: data.priority as any,
      status: 'moi',
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignments: [],
      members: [],
      channelId: `channel-${uuid()}`,
      caseTemplates: [],
    };
    
    this.cases.push(newCase);
    this.saveData();
    return newCase;
  }

  // ============ Task Templates ============

  getTaskTemplates() {
    return TASK_TEMPLATES;
  }

  getTaskTemplateById(id: string) {
    return TASK_TEMPLATES.find(t => t.id === id);
  }

  getAvailableTemplates(caseId: string) {
    const caseItem = this.findById(caseId);
    if (!caseItem) return [];
    
    const assignedTemplateIds = caseItem.assignments.map(a => a.taskTemplateId);
    const addedTemplateIds = caseItem.caseTemplates?.map(ct => ct.templateId) || [];
    // Templates not yet assigned AND not yet added to case
    return TASK_TEMPLATES.filter(t => !assignedTemplateIds.includes(t.id) && !addedTemplateIds.includes(t.id));
  }

  // ============ Case Templates Methods (Templates added to case, not yet assigned) ============

  /**
   * Get templates that have been added to the case (not yet assigned to anyone)
   */
  getCaseTemplates(caseId: string): CaseTemplate[] {
    const caseItem = this.findById(caseId);
    return caseItem?.caseTemplates || [];
  }

  /**
   * Add a template to the case (without assigning to anyone yet)
   */
  addTemplateToCase(caseId: string, templateId: string, addedBy: string): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    const template = this.getTaskTemplateById(templateId);
    if (!template) return null;

    // Check if template already exists in caseTemplates or assignments
    const existingInCaseTemplates = caseItem.caseTemplates?.some(ct => ct.templateId === templateId);
    const existingInAssignments = caseItem.assignments.some(a => a.taskTemplateId === templateId);
    
    if (existingInCaseTemplates || existingInAssignments) {
      return caseItem; // Already added
    }

    if (!caseItem.caseTemplates) {
      caseItem.caseTemplates = [];
    }

    const caseTemplate: CaseTemplate = {
      id: uuid(),
      templateId,
      templateName: template.name,
      addedAt: new Date(),
      addedBy,
    };

    caseItem.caseTemplates.push(caseTemplate);
    caseItem.updatedAt = new Date();
    this.saveData();
    
    return caseItem;
  }

  /**
   * Remove a template from the case (only if not yet assigned)
   */
  removeTemplateFromCase(caseId: string, templateId: string): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    // Check if template is already assigned
    const isAssigned = caseItem.assignments.some(a => a.taskTemplateId === templateId);
    if (isAssigned) {
      return null; // Cannot remove assigned template
    }

    caseItem.caseTemplates = caseItem.caseTemplates?.filter(ct => ct.templateId !== templateId) || [];
    caseItem.updatedAt = new Date();
    this.saveData();
    
    return caseItem;
  }

  /**
   * Assign a template from caseTemplates to a specific user
   * OR create a custom task (templateId = 'custom')
   */
  assignTemplateFromCase(
    caseId: string, 
    templateId: string, 
    userId: string, 
    userName: string, 
    assignedBy: string, 
    role: 'truong-nhom' | 'thanh-vien' = 'thanh-vien',
    customTask?: {
      title: string;
      description?: string;
      priority?: 'high' | 'medium' | 'low';
      estimatedTime?: string;
      required?: boolean;
    }
  ): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    // If custom task, create it directly without adding to caseTemplates
    if (templateId === 'custom' && customTask) {
      return this.createCustomTask(caseId, userId, userName, assignedBy, role, customTask);
    }

    // First add template to case if not already there
    this.addTemplateToCase(caseId, templateId, assignedBy);

    // Then assign to user
    const result = this.assignTemplate(caseId, userId, userName, templateId, assignedBy, role);
    
    // Remove from caseTemplates after assignment
    if (result) {
      caseItem.caseTemplates = caseItem.caseTemplates?.filter(ct => ct.templateId !== templateId) || [];
      this.saveData();
    }
    
    return result;
  }

  // ============ Assignment Methods ============

  /**
   * Create a custom task (free-form, not from template)
   */
  createCustomTask(
    caseId: string,
    userId: string,
    userName: string,
    assignedBy: string,
    role: 'truong-nhom' | 'thanh-vien',
    customTask: {
      title: string;
      description?: string;
      priority?: 'high' | 'medium' | 'low';
      estimatedTime?: string;
      required?: boolean;
    }
  ): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    const taskTemplateName = customTask.title || 'Nhiệm vụ tùy chỉnh';
    
    const assignment: Assignment = {
      userId,
      userName,
      role,
      taskTemplateId: 'custom',
      taskTemplateName: taskTemplateName,
      tasks: [{
        id: uuid(),
        title: customTask.title,
        description: customTask.description || '',
        priority: customTask.priority || 'medium',
        estimatedTime: customTask.estimatedTime || '30 phút',
        required: customTask.required ?? true,
        completed: false,
      }],
      assignedAt: new Date(),
      assignedBy,
    };

    caseItem.assignments.push(assignment);
    caseItem.status = 'dang-xu-ly';
    caseItem.updatedAt = new Date();
    this.saveData();
    
    return caseItem;
  }

  assignTemplate(
    caseId: string, 
    userId: string, 
    userName: string,
    templateId: string, 
    assignedBy: string,
    role: 'truong-nhom' | 'thanh-vien' = 'thanh-vien',
    customTask?: {
      title: string;
      description?: string;
      priority?: 'high' | 'medium' | 'low';
      estimatedTime?: string;
      required?: boolean;
    }
  ): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    // If custom task (templateId = 'custom')
    if (templateId === 'custom' && customTask) {
      return this.createCustomTask(caseId, userId, userName, assignedBy, role, customTask);
    }

    const template = this.getTaskTemplateById(templateId);
    if (!template) return null;

    // Check if user already has this template assigned
    const existing = caseItem.assignments.find(a => a.userId === userId && a.taskTemplateId === templateId);
    if (existing) return caseItem;

    const assignment: Assignment = {
      userId,
      userName,
      role,
      taskTemplateId: templateId,
      taskTemplateName: template.name,
      tasks: template.checklist.map(item => ({
        id: uuid(),
        title: item.title,
        description: item.description,
        priority: item.priority as 'high' | 'medium' | 'low',
        estimatedTime: item.estimatedTime,
        required: item.required,
        completed: false,
      })),
      assignedAt: new Date(),
      assignedBy,
    };

    caseItem.assignments.push(assignment);
    caseItem.status = 'dang-xu-ly';
    caseItem.updatedAt = new Date();
    this.saveData();
    
    return caseItem;
  }

  removeAssignment(caseId: string, userId: string, templateId?: string): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    if (templateId) {
      // Remove specific assignment
      caseItem.assignments = caseItem.assignments.filter(
        a => !(a.userId === userId && a.taskTemplateId === templateId)
      );
    } else {
      // Remove all assignments for this user
      caseItem.assignments = caseItem.assignments.filter(a => a.userId !== userId);
    }

    // Update status if no assignments left
    if (caseItem.assignments.length === 0) {
      caseItem.status = 'moi';
    }

    caseItem.updatedAt = new Date();
    return caseItem;
  }

  // ============ Task Progress ============

  updateTask(caseId: string, userId: string, taskId: string, completed: boolean): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    const assignment = caseItem.assignments.find(a => a.userId === userId);
    if (!assignment) return null;

    const task = assignment.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.completed = completed;
    task.completedAt = completed ? new Date() : undefined;
    caseItem.updatedAt = new Date();

    // Check if all tasks are completed
    const allCompleted = caseItem.assignments.every(a => 
      a.tasks.every(t => t.completed)
    );
    if (allCompleted) {
      caseItem.status = 'hoan-thanh';
    }

    this.saveData();
    return caseItem;
  }

  getCaseProgress(caseId: string): { total: number; completed: number; percentage: number } {
    const caseItem = this.findById(caseId);
    if (!caseItem) return { total: 0, completed: 0, percentage: 0 };

    let total = 0;
    let completed = 0;

    caseItem.assignments.forEach(a => {
      a.tasks.forEach(t => {
        total++;
        if (t.completed) completed++;
      });
    });

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  getAssignmentProgress(caseId: string, userId: string, templateId?: string): { total: number; completed: number; percentage: number } {
    const caseItem = this.findById(caseId);
    if (!caseItem) return { total: 0, completed: 0, percentage: 0 };

    let total = 0;
    let completed = 0;

    caseItem.assignments.forEach(a => {
      if (a.userId === userId && (!templateId || a.taskTemplateId === templateId)) {
        a.tasks.forEach(t => {
          total++;
          if (t.completed) completed++;
        });
      }
    });

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  // ============ Report ============

  submitReport(caseId: string, report: string, userLevel: number = 3): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    const template = REPORT_TEMPLATES[userLevel];
    const structuredReport = {
      content: report,
      level: userLevel,
      templateTitle: template?.title || 'BÁO CÁO',
      submittedAt: new Date().toISOString()
    };

    caseItem.report = JSON.stringify(structuredReport);
    caseItem.reportSubmittedAt = new Date();
    caseItem.updatedAt = new Date();
    
    return caseItem;
  }

  getReportTemplate(level: number): ReportTemplate {
    return REPORT_TEMPLATES[level] || REPORT_TEMPLATES[3];
  }

  delete(id: string): boolean {
    const index = this.cases.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.cases.splice(index, 1);
    return true;
  }

  // ============ Case Members Methods ============

  getMembers(caseId: string): CaseMember[] {
    const caseItem = this.findById(caseId);
    return caseItem?.members || [];
  }

  isMember(caseId: string, userId: string): boolean {
    const members = this.getMembers(caseId);
    return members.some(m => m.userId === userId);
  }

  joinCase(caseId: string, userId: string): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    if (this.isMember(caseId, userId)) {
      return caseItem;
    }

    if (!caseItem.members) {
      caseItem.members = [];
    }

    const newMember: CaseMember = {
      userId,
      role: 'thanh-vien',
      joinedAt: new Date(),
      isActive: true
    };

    caseItem.members.push(newMember);
    caseItem.updatedAt = new Date();
    
    return caseItem;
  }

  addMember(caseId: string, userId: string, role: 'truong-nhom' | 'thanh-vien' = 'thanh-vien'): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem) return null;

    if (!caseItem.members) {
      caseItem.members = [];
    }

    if (this.isMember(caseId, userId)) {
      const existingMember = caseItem.members.find(m => m.userId === userId);
      if (existingMember) {
        existingMember.role = role;
        caseItem.updatedAt = new Date();
      }
      return caseItem;
    }

    const newMember: CaseMember = {
      userId,
      role,
      joinedAt: new Date(),
      isActive: true
    };

    caseItem.members.push(newMember);
    caseItem.updatedAt = new Date();
    this.saveData();
    
    return caseItem;
  }

  removeMember(caseId: string, userId: string): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem || !caseItem.members) return null;

    caseItem.members = caseItem.members.filter(m => m.userId !== userId);
    caseItem.updatedAt = new Date();
    this.saveData();
    
    return caseItem;
  }

  updateMemberRole(caseId: string, userId: string, role: 'truong-nhom' | 'thanh-vien'): Case | null {
    const caseItem = this.findById(caseId);
    if (!caseItem || !caseItem.members) return null;

    const member = caseItem.members.find(m => m.userId === userId);
    if (!member) return null;

    member.role = role;
    caseItem.updatedAt = new Date();
    this.saveData();
    
    return caseItem;
  }

  findByUserId(userId: string): Case[] {
    return this.cases.filter(c => 
      c.createdBy === userId || 
      c.members?.some(m => m.userId === userId) ||
      c.assignments?.some(a => a.userId === userId)
    );
  }

  getCasesByMember(userId: string): Case[] {
    return this.cases.filter(c => 
      c.members?.some(m => m.userId === userId)
    );
  }
}
