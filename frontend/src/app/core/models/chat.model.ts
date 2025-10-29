import { User } from './user.model';

export interface ChatMessage {
  id: string; 
  sender: User;
  receiver: User;
  messageText: string;
  sentAt: Date;
  isRead: boolean;
}