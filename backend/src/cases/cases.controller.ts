import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CasesService, REPORT_TEMPLATES, TASK_TEMPLATES } from './cases.service';
import { Case, Assignment, CaseMember, CaseTemplate } from './case.entity';

@Controller('api/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll(@Query('userId') userId?: string): Case[] {
    if (userId) {
      return this.casesService.findByUser(userId);
    }
    return this.casesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Case | undefined {
    return this.casesService.findById(id);
  }

  @Get('templates/report')
  getReportTemplates(): typeof REPORT_TEMPLATES {
    return REPORT_TEMPLATES;
  }

  @Get('templates/task')
  getTaskTemplates() {
    return TASK_TEMPLATES;
  }

  @Post()
  create(@Body() data: { title: string; description: string; priority: string; createdBy: string }): Case {
    return this.casesService.create(data);
  }

  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() data: Assignment
  ): Case | { error: string } {
    const result = this.casesService.assignTemplate(
      id, 
      data.userId, 
      data.userName || data.userId,
      data.taskTemplateId, 
      data.assignedBy || 'system',
      data.role
    );
    if (!result) return { error: 'Case not found' };
    return result;
  }

  // ============ Task Templates ============

  /**
   * Get available task templates for a case (not yet assigned)
   */
  @Get(':id/available-templates')
  getAvailableTemplates(@Param('id') id: string) {
    return this.casesService.getAvailableTemplates(id);
  }

  /**
   * Get case progress
   */
  @Get(':id/progress')
  getCaseProgress(@Param('id') id: string) {
    return this.casesService.getCaseProgress(id);
  }

  /**
   * Get case templates (templates added to case but not yet assigned)
   */
  @Get(':id/case-templates')
  getCaseTemplates(@Param('id') id: string): CaseTemplate[] | { error: string } {
    const caseItem = this.casesService.findById(id);
    if (!caseItem) return { error: 'Case not found' };
    return this.casesService.getCaseTemplates(id);
  }

  /**
   * Add a template to the case (without assigning to anyone yet)
   */
  @Post(':id/case-templates')
  addTemplateToCase(
    @Param('id') id: string,
    @Body() data: { templateId: string; addedBy: string }
  ): Case | { error: string } {
    const result = this.casesService.addTemplateToCase(id, data.templateId, data.addedBy);
    if (!result) return { error: 'Case not found' };
    return result;
  }

  /**
   * Remove a template from the case (only if not yet assigned)
   */
  @Delete(':id/case-templates/:templateId')
  removeTemplateFromCase(
    @Param('id') id: string,
    @Param('templateId') templateId: string
  ): Case | { error: string } {
    const result = this.casesService.removeTemplateFromCase(id, templateId);
    if (!result) return { error: 'Template not found or already assigned' };
    return result;
  }

  /**
   * Assign a task template from case templates to a user
   * OR create a custom task (templateId = 'custom')
   */
  @Post(':id/assign-task')
  assignTask(
    @Param('id') id: string,
    @Body() data: { 
      templateId: string; 
      userId: string; 
      userName: string;
      assignedBy: string;
      role?: 'truong-nhom' | 'thanh-vien';
      customTask?: {
        title: string;
        description?: string;
        priority?: 'high' | 'medium' | 'low';
        estimatedTime?: string;
        required?: boolean;
      };
    }
  ): Case | { error: string } {
    const result = this.casesService.assignTemplateFromCase(
      id,
      data.templateId,
      data.userId,
      data.userName,
      data.assignedBy,
      data.role || 'thanh-vien',
      data.customTask
    );
    if (!result) return { error: 'Case or template not found' };
    return result;
  }

  /**
   * Assign a task template to a user
   */
  @Post(':id/assign-template')
  assignTemplate(
    @Param('id') id: string,
    @Body() data: { 
      userId: string; 
      userName: string;
      templateId: string;
      assignedBy: string;
      role?: 'truong-nhom' | 'thanh-vien';
    }
  ): Case | { error: string } {
    const result = this.casesService.assignTemplate(
      id,
      data.userId,
      data.userName,
      data.templateId,
      data.assignedBy,
      data.role || 'thanh-vien'
    );
    if (!result) return { error: 'Case not found' };
    return result;
  }

  /**
   * Remove an assignment
   */
  @Delete(':id/assignments/:userId/:templateId')
  removeAssignment(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('templateId') templateId: string
  ): Case | { error: string } {
    const result = this.casesService.removeAssignment(id, userId, templateId);
    if (!result) return { error: 'Case or assignment not found' };
    return result;
  }

  // ============ Tasks ============

  @Put(':id/tasks/:taskId')
  updateTask(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Param('taskId') taskId: string,
    @Body('completed') completed: boolean
  ): Case | { error: string } {
    const result = this.casesService.updateTask(id, userId, taskId, completed);
    if (!result) return { error: 'Case or task not found' };
    return result;
  }

  // ============ Reports ============

  @Put(':id/report')
  submitReport(
    @Param('id') id: string,
    @Body() data: { report: string; userLevel?: number }
  ): Case | { error: string } {
    const result = this.casesService.submitReport(id, data.report, data.userLevel || 3);
    if (!result) return { error: 'Case not found' };
    return result;
  }

  @Delete(':id')
  delete(@Param('id') id: string): { success: boolean } {
    return { success: this.casesService.delete(id) };
  }

  // ============ Case Members ============

  @Get(':id/members')
  getMembers(@Param('id') id: string): CaseMember[] | { error: string } {
    const caseItem = this.casesService.findById(id);
    if (!caseItem) return { error: 'Case not found' };
    return this.casesService.getMembers(id);
  }

  @Get(':id/members/check')
  checkMembership(
    @Param('id') id: string,
    @Query('userId') userId: string
  ): { isMember: boolean } {
    return { isMember: this.casesService.isMember(id, userId) };
  }

  @Post(':id/join')
  join(
    @Param('id') id: string,
    @Body() data: { userId: string }
  ): Case | { error: string } {
    const result = this.casesService.joinCase(id, data.userId);
    if (!result) return { error: 'Case not found' };
    return result;
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() data: { userId: string; role?: 'truong-nhom' | 'thanh-vien' }
  ): Case | { error: string } {
    const result = this.casesService.addMember(id, data.userId, data.role || 'thanh-vien');
    if (!result) return { error: 'Case not found' };
    return result;
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string
  ): Case | { error: string } {
    const result = this.casesService.removeMember(id, userId);
    if (!result) return { error: 'Case or member not found' };
    return result;
  }

  @Put(':id/members/:userId/role')
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: 'truong-nhom' | 'thanh-vien'
  ): Case | { error: string } {
    const result = this.casesService.updateMemberRole(id, userId, role);
    if (!result) return { error: 'Case or member not found' };
    return result;
  }

  @Get('user/:userId')
  getUserCases(@Param('userId') userId: string): Case[] {
    return this.casesService.findByUserId(userId);
  }
}
