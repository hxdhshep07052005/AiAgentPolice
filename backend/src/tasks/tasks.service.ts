import { Injectable } from '@nestjs/common';
import { TaskTemplate, UserTask, UserChecklistItem } from './task.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TasksService {
  private taskTemplates: TaskTemplate[] = [
    {
      id: 'kham-nghiem-hien-truong',
      name: 'Khám nghiệm hiện trường',
      description: 'Khám nghiệm và thu thập dấu vết tại hiện trường',
      requiredSkills: ['kham-nghiem', 'chup-anh', 'thu-thap-dau-vet'],
      checklist: [
        { id: 'kn-1', title: 'Bảo vệ hiện trường', description: 'Đảm bảo hiện trường không bị xáo trộn', priority: 'high', estimatedTime: '15 phút', required: true },
        { id: 'kn-2', title: 'Chụp ảnh toàn cảnh', description: 'Chụp ảnh tổng quan từ nhiều góc', priority: 'high', estimatedTime: '10 phút', required: true },
        { id: 'kn-3', title: 'Lập sơ đồ hiện trường', description: 'Vẽ sơ đồ vị trí các vật chứng', priority: 'high', estimatedTime: '20 phút', required: true },
        { id: 'kn-4', title: 'Thu thập dấu vết', description: 'Thu thập vân tay, DNA và các dấu vết', priority: 'high', estimatedTime: '45 phút', required: true },
        { id: 'kn-5', title: 'Đánh dấu vật chứng', description: 'Đánh số và ghi nhận vị trí vật chứng', priority: 'medium', estimatedTime: '20 phút', required: false },
        { id: 'kn-6', title: 'Ghi chép nhật ký', description: 'Ghi lại thời gian và sự kiện quan trọng', priority: 'high', estimatedTime: '15 phút', required: true },
      ],
    },
    {
      id: 'tra-cuu-camera',
      name: 'Tra cứu camera',
      description: 'Thu thập và phân tích hình ảnh từ camera',
      requiredSkills: ['tra-camera', 'phan-tich-anh', 'doi-chung-chi'],
      checklist: [
        { id: 'tc-1', title: 'Xác định camera xung quanh', description: 'Liệt kê camera trong bán kính 500m', priority: 'high', estimatedTime: '10 phút', required: true },
        { id: 'tc-2', title: 'Liên hệ chủ camera', description: 'Xin cung cấp footage camera', priority: 'high', estimatedTime: '15 phút', required: true },
        { id: 'tc-3', title: 'Thu thập footage', description: 'Sao chép footage trong khung giờ liên quan', priority: 'high', estimatedTime: '30 phút', required: true },
        { id: 'tc-4', title: 'Phân tích footage', description: 'Xác định đối tượng, thời gian, hành vi', priority: 'high', estimatedTime: '60 phút', required: true },
        { id: 'tc-5', title: 'Tạo bản tóm tắt', description: 'Tóm tắt các điểm quan trọng', priority: 'medium', estimatedTime: '20 phút', required: false },
      ],
    },
    {
      id: 'doi-chung-chi',
      name: 'Đối chiếu chứng cứ',
      description: 'Đối chiếu và phân tích các chứng cứ thu thập được',
      requiredSkills: ['phan-tich', 'co-so-du-lieu'],
      checklist: [
        { id: 'dc-1', title: 'Thu thập tất cả chứng cứ', description: 'Tập hợp chứng cứ từ các nguồn', priority: 'high', estimatedTime: '30 phút', required: true },
        { id: 'dc-2', title: 'Đối chiếu thông tin', description: 'So sánh và tìm điểm trùng khớp', priority: 'high', estimatedTime: '45 phút', required: true },
        { id: 'dc-3', title: 'Lập timeline sự kiện', description: 'Xây dựng timeline các sự kiện', priority: 'medium', estimatedTime: '30 phút', required: false },
        { id: 'dc-4', title: 'Tạo báo cáo phân tích', description: 'Viết báo cáo chi tiết', priority: 'high', estimatedTime: '30 phút', required: true },
      ],
    },
  ];

  private userTasks: Map<string, UserTask> = new Map();

  getTemplates(): TaskTemplate[] {
    return this.taskTemplates;
  }

  getTemplateById(id: string): TaskTemplate | undefined {
    return this.taskTemplates.find(t => t.id === id);
  }

  createUserTask(userId: string, caseId: string, templateId: string): UserTask | null {
    const template = this.getTemplateById(templateId);
    if (!template) return null;

    const checklist: UserChecklistItem[] = template.checklist.map(item => ({
      id: uuid(),
      templateItemId: item.id,
      title: item.title,
      description: item.description,
      priority: item.priority,
      estimatedTime: item.estimatedTime,
      completed: false,
    }));

    const userTask: UserTask = {
      id: uuid(),
      userId,
      caseId,
      templateId,
      templateName: template.name,
      checklist,
      completedCount: 0,
      totalCount: checklist.length,
      progress: 0,
    };

    const key = `${userId}-${caseId}-${templateId}`;
    this.userTasks.set(key, userTask);
    return userTask;
  }

  getUserTask(userId: string, caseId: string, templateId: string): UserTask | undefined {
    const key = `${userId}-${caseId}-${templateId}`;
    return this.userTasks.get(key);
  }

  getUserTasksForCase(userId: string, caseId: string): UserTask[] {
    const tasks: UserTask[] = [];
    this.userTasks.forEach(task => {
      if (task.userId === userId && task.caseId === caseId) {
        tasks.push(task);
      }
    });
    return tasks;
  }

  toggleTaskItem(userId: string, caseId: string, templateId: string, itemId: string, completed: boolean): UserTask | null {
    const key = `${userId}-${caseId}-${templateId}`;
    const task = this.userTasks.get(key);
    if (!task) return null;

    const item = task.checklist.find(c => c.id === itemId);
    if (!item) return null;

    item.completed = completed;
    item.completedAt = completed ? new Date() : undefined;

    task.completedCount = task.checklist.filter(c => c.completed).length;
    task.progress = Math.round((task.completedCount / task.totalCount) * 100);

    return task;
  }
}
