import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatChannel, ChatMessage } from './chat.entity';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('channels')
  createChannel(@Body() data: { caseId: string; name: string; creatorId: string }): ChatChannel {
    return this.chatService.createChannel(data.caseId, data.name, data.creatorId);
  }

  @Get('channels/:channelId')
  getChannel(@Param('channelId') channelId: string): ChatChannel | undefined {
    return this.chatService.getChannel(channelId);
  }

  @Get('channels/case/:caseId')
  getChannelByCase(@Param('caseId') caseId: string): ChatChannel | undefined {
    return this.chatService.getChannelByCaseId(caseId);
  }

  @Post('channels/:channelId/members')
  addMember(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): ChatChannel | { error: string } {
    const result = this.chatService.addMember(channelId, userId);
    if (!result) return { error: 'Channel not found' };
    return result;
  }

  @Post('channels/:channelId/messages')
  sendMessage(
    @Param('channelId') channelId: string,
    @Body() data: {
      senderId: string;
      senderName: string;
      senderAvatar: string;
      senderRole: string;
      content: string;
      type?: string;
      mentions?: string[];
    }
  ): ChatMessage {
    return this.chatService.sendMessage(
      channelId,
      data.senderId,
      data.senderName,
      data.senderAvatar,
      data.senderRole,
      data.content,
      data.type as any || 'message',
      data.mentions
    );
  }

  @Get('channels/:channelId/messages')
  getMessages(@Param('channelId') channelId: string): ChatMessage[] {
    return this.chatService.getMessages(channelId);
  }

  @Get('channels/case/:caseId/messages')
  getMessagesByCase(@Param('caseId') caseId: string): ChatMessage[] {
    return this.chatService.getMessagesByCaseId(caseId);
  }

  /**
   * Get new messages since a timestamp (for polling/real-time)
   */
  @Get('channels/:channelId/messages/since')
  getMessagesSince(
    @Param('channelId') channelId: string,
    @Query('since') since: string
  ): { messages: ChatMessage[]; latestTimestamp: string | null } {
    const sinceDate = since ? new Date(since) : new Date(0);
    const messages = this.chatService.getMessagesSince(channelId, sinceDate);
    const latestTimestamp = this.chatService.getLatestMessageTimestamp(channelId);
    return {
      messages,
      latestTimestamp: latestTimestamp ? latestTimestamp.toISOString() : null
    };
  }
}
