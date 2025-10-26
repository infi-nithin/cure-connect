import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMessage } from '../models/chat.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket | null = null;
  private messageSubject = new Subject<ChatMessage>();
  public messages$ = this.messageSubject.asObservable();
  
  private connectionStatusSubject = new BehaviorSubject<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  private currentAppointmentId: number | null = null;
  private historyLoadedSubject = new Subject<ChatMessage[]>();

  constructor(private authService: AuthService) {}

  connect(appointmentId: number): Promise<void> {
    this.currentAppointmentId = appointmentId;

    if (this.socket?.connected) {
      this.requestChatHistory(appointmentId);
      return Promise.resolve();
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.connectionStatusSubject.next('connecting');

    return new Promise((resolve, reject) => {
      const token = this.authService.token;
      this.socket = io(environment.wsUrl, {
        auth: { token },
        query: { appointmentId: appointmentId.toString() },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.connectionStatusSubject.next('connected');
        this.requestChatHistory(appointmentId);
        resolve();
      });

      this.socket.on('message', (message: ChatMessage) => {
        this.messageSubject.next(message);
      });

      this.socket.on('chatHistory', (history: ChatMessage[]) => {
        this.historyLoadedSubject.next(history);
      });

      this.socket.on('reconnect', (attemptNumber: number) => {
        console.log(`Reconnected to WebSocket server after ${attemptNumber} attempts`);
        this.connectionStatusSubject.next('connected');
        if (this.currentAppointmentId) {
          this.requestChatHistory(this.currentAppointmentId);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        this.connectionStatusSubject.next('disconnected');
      });

      this.socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        this.connectionStatusSubject.next('error');
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('WebSocket connection error:', error);
        this.connectionStatusSubject.next('error');
        reject(error);
      });
    });
  }

  private requestChatHistory(appointmentId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('getChatHistory', { appointmentId });
    }
  }

  sendMessage(appointmentId: number, message: string): void {
    if (this.socket?.connected) {
      const user = this.authService.currentUserValue;
      const chatMessage: Partial<ChatMessage> = {
        appointmentId,
        message,
        senderId: user?.id,
        senderName: `${user?.firstName} ${user?.lastName}`,
        timestamp: new Date()
      };
      this.socket.emit('sendMessage', chatMessage);
    }
  }

  loadChatHistory(): Observable<ChatMessage[]> {
    return this.historyLoadedSubject.asObservable();
  }

  retry(appointmentId: number): void {
    this.connect(appointmentId).catch(error => {
      console.error('Retry connection failed:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentAppointmentId = null;
      this.connectionStatusSubject.next('disconnected');
    }
  }
}
