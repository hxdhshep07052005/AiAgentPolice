import { Controller, Get, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  async checkStatus() {
    return this.aiService.checkStatus();
  }

  @Post('suggest-assignment')
  async suggestAssignment(
    @Body() data: { description: string; agents: any[] }
  ) {
    return this.aiService.suggestAssignment(data.description, data.agents);
  }

  @Post('check-report')
  async checkReport(
    @Body() data: { report: string; checklist: any[]; userLevel?: number }
  ) {
    return this.aiService.checkReport(data.report, data.checklist, data.userLevel || 3);
  }

  @Post('chat')
  async chat(
    @Body() data: { 
      message: string; 
      history?: any[]; 
      cases?: any[];
      users?: any[];
      selectedCaseId?: string;
    }
  ) {
    return this.aiService.chat(
      data.message, 
      data.history || [], 
      {
        cases: data.cases,
        users: data.users,
        selectedCaseId: data.selectedCaseId
      }
    );
  }

  @Post('query-case')
  async queryCaseInfo(
    @Body() data: { question: string; context: any }
  ) {
    return this.aiService.queryCaseInfo(data.question, data.context);
  }
}
