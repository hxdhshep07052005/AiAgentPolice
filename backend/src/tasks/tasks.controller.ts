import { Controller, Get, Post, Put, Param, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskTemplate, UserTask } from './task.entity';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('templates')
  getTemplates(): TaskTemplate[] {
    return this.tasksService.getTemplates();
  }

  @Get('templates/:id')
  getTemplate(@Param('id') id: string): TaskTemplate | undefined {
    return this.tasksService.getTemplateById(id);
  }

  @Get('user')
  getUserTasks(
    @Query('userId') userId: string,
    @Query('caseId') caseId: string
  ): UserTask[] {
    return this.tasksService.getUserTasksForCase(userId, caseId);
  }

  @Post('user')
  createUserTask(
    @Query('userId') userId: string,
    @Query('caseId') caseId: string,
    @Query('templateId') templateId: string
  ): UserTask | { error: string } {
    const result = this.tasksService.createUserTask(userId, caseId, templateId);
    if (!result) return { error: 'Template not found' };
    return result;
  }

  @Put(':itemId/toggle')
  toggleTask(
    @Param('itemId') itemId: string,
    @Query('userId') userId: string,
    @Query('caseId') caseId: string,
    @Query('templateId') templateId: string,
    @Query('completed') completed: string
  ): UserTask | { error: string } {
    const result = this.tasksService.toggleTaskItem(
      userId, 
      caseId, 
      templateId, 
      itemId, 
      completed === 'true'
    );
    if (!result) return { error: 'Task not found' };
    return result;
  }
}
