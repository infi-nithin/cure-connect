import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessage } from '../../../core/models/chat.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  newMessage = '';
  appointmentId!: number;
  private messageSubscription?: Subscription;
  private historySubscription?: Subscription;
  private statusSubscription?: Subscription;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));
    
    this.statusSubscription = this.chatService.connectionStatus$.subscribe(status => {
      this.connectionStatus = status;
    });

    this.messageSubscription = this.chatService.messages$.subscribe(message => {
      this.messages.push(message);
    });

    this.historySubscription = this.chatService.loadChatHistory().subscribe(history => {
      this.messages = history;
    });

    this.chatService.connect(this.appointmentId).catch(error => {
      console.error('Failed to connect to chat:', error);
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.connectionStatus === 'connected') {
      this.chatService.sendMessage(this.appointmentId, this.newMessage);
      this.newMessage = '';
    }
  }

  retry(): void {
    this.chatService.retry(this.appointmentId);
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.historySubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    this.chatService.disconnect();
  }
}
