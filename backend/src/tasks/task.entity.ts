export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  required: boolean;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  checklist: ChecklistItem[];
}

export interface UserTask {
  id: string;
  userId: string;
  caseId: string;
  templateId: string;
  templateName: string;
  checklist: UserChecklistItem[];
  completedCount: number;
  totalCount: number;
  progress: number;
}

export interface UserChecklistItem {
  id: string;
  templateItemId: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  completed: boolean;
  completedAt?: Date;
}
