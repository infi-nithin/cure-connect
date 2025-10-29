import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessage } from '../../../core/models/chat.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  newMessage = '';
  appointmentId!: string;
  currentUser: User | null = null;
  receiverId!: string;
  private messageSubscription?: Subscription;
  private statusSubscription?: Subscription;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId') || '';
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      console.error('No user logged in');
      return;
    }

    this.receiverId = this.getReceiverIdFromAppointment();

    this.statusSubscription = this.chatService.connectionStatus$.subscribe(status => {
      this.connectionStatus = status;
    });

    this.messageSubscription = this.chatService.messages$.subscribe(message => {
      this.messages.push(message);
      this.scrollToBottom();
    });

    this.loadChatHistory();

    this.chatService.connect(this.currentUser.id);
  }

  private getReceiverIdFromAppointment(): string {
    // This is a placeholder - you'll need to implement logic to get the receiver ID
    // For example, if the current user is a patient, receiver would be the doctor, and vice versa
    // You might need to fetch appointment details to get the other participant
    return 'doctor-id-placeholder'; // Replace with actual logic
  }

  private loadChatHistory(): void {
    if (this.currentUser) {
      this.chatService.loadChatHistory(this.currentUser.id, this.receiverId).subscribe({
        next: (history) => {
          this.messages = history;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error loading chat history:', error);
        }
      });
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.connectionStatus === 'connected' && this.currentUser) {
      this.chatService.sendMessage(this.currentUser.id, this.receiverId, this.newMessage);
      
      const optimisticMessage: ChatMessage = {
        id: 'temp-' + Date.now(),
        sender: this.currentUser,
        receiver: { 
          id: this.receiverId,
          email: '',
          enabled: true,
          createdAt: new Date(),
          roles: []
        } as any, 
        messageText: this.newMessage,
        sentAt: new Date(),
        isRead: false
      };
      
      this.messages.push(optimisticMessage);
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  retry(): void {
    if (this.currentUser) {
      this.chatService.connect(this.currentUser.id);
    }
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    this.chatService.disconnect();
  }

  // Helper methods for template
  isCurrentUser(senderId: string): boolean {
    return this.currentUser?.id === senderId;
  }

  getSenderName(message: ChatMessage): string {
    return message.sender.email.split('@')[0];
  }

  formatMessageTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}