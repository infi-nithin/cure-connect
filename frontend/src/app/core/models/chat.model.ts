export interface ChatMessage {
  id: number;
  appointmentId: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatRoom {
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}
