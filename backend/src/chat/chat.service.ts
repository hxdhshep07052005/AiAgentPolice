import { Injectable } from '@nestjs/common';
import { ChatMessage, ChatChannel } from './chat.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ChatService {
  private channels: Map<string, ChatChannel> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();

  createChannel(caseId: string, name: string, creatorId: string): ChatChannel {
    const channelId = `channel-${uuid()}`;
    const channel: ChatChannel = {
      id: channelId,
      caseId,
      name,
      members: [creatorId, 'ai-assistant'],
      createdAt: new Date(),
    };
    this.channels.set(channelId, channel);
    this.messages.set(channelId, []);
    return channel;
  }

  getChannel(channelId: string): ChatChannel | undefined {
    return this.channels.get(channelId);
  }

  getChannelByCaseId(caseId: string): ChatChannel | undefined {
    for (const channel of this.channels.values()) {
      if (channel.caseId === caseId) {
        return channel;
      }
    }
    return undefined;
  }

  addMember(channelId: string, userId: string): ChatChannel | null {
    const channel = this.channels.get(channelId);
    if (!channel) return null;
    if (!channel.members.includes(userId)) {
      channel.members.push(userId);
    }
    return channel;
  }

  removeMember(channelId: string, userId: string): ChatChannel | null {
    const channel = this.channels.get(channelId);
    if (!channel) return null;
    channel.members = channel.members.filter(m => m !== userId);
    return channel;
  }

  sendMessage(
    channelId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    senderRole: string,
    content: string,
    type: 'message' | 'system' | 'report' | 'ai' = 'message',
    mentions?: string[]
  ): ChatMessage {
    const message: ChatMessage = {
      id: uuid(),
      channelId,
      senderId,
      senderName,
      senderAvatar,
      senderRole,
      type,
      content,
      mentions,
      timestamp: new Date(),
    };

    const messages = this.messages.get(channelId) || [];
    messages.push(message);
    this.messages.set(channelId, messages);

    return message;
  }

  getMessages(channelId: string): ChatMessage[] {
    return this.messages.get(channelId) || [];
  }

  getMessagesByCaseId(caseId: string): ChatMessage[] {
    const channel = this.getChannelByCaseId(caseId);
    if (!channel) return [];
    return this.getMessages(channel.id);
  }

  /**
   * Get messages newer than a specific timestamp (for polling)
   */
  getMessagesSince(channelId: string, since: Date): ChatMessage[] {
    const messages = this.getMessages(channelId);
    return messages.filter(m => new Date(m.timestamp) > since);
  }

  /**
   * Get latest message timestamp for a channel
   */
  getLatestMessageTimestamp(channelId: string): Date | null {
    const messages = this.getMessages(channelId);
    if (messages.length === 0) return null;
    return new Date(Math.max(...messages.map(m => new Date(m.timestamp).getTime())));
  }
}
