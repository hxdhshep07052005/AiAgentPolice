export interface CaseMember {
  userId: string;
  role: 'truong-nhom' | 'thanh-vien';
  joinedAt: Date;
  isActive: boolean;
}

export interface CaseTemplate {
  id: string;
  templateId: string;
  templateName: string;
  addedAt: Date;
  addedBy: string;
}

export interface Assignment {
  userId: string;
  userName: string;
  role: 'truong-nhom' | 'thanh-vien';
  taskTemplateId: string;
  taskTemplateName: string;
  tasks: TaskItem[];
  assignedAt: Date;
  assignedBy: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'moi' | 'dang-xu-ly' | 'hoan-thanh' | 'qua-han';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  assignments: Assignment[];
  members: CaseMember[];
  channelId: string;
  report?: string;
  reportSubmittedAt?: Date;
  caseTemplates: CaseTemplate[];
}
