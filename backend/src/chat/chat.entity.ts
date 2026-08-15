export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  type: 'message' | 'system' | 'report' | 'ai';
  content: string;
  attachments?: string[];
  mentions?: string[];
  timestamp: Date;
}

export interface ChatChannel {
  id: string;
  caseId: string;
  name: string;
  members: string[];
  createdAt: Date;
}
