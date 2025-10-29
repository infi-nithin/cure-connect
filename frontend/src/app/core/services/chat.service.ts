import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMessage } from '../models/chat.model';
import { AuthService } from './auth.service';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client | null = null;
  private messageSubject = new Subject<ChatMessage>();
  public messages$ = this.messageSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private historyLoadedSubject = new Subject<ChatMessage[]>();

  constructor(private authService: AuthService, private http: HttpClient) {}

  connect(userId: string) {
    if (this.stompClient?.active) {
      return;
    }

    this.connectionStatusSubject.next('connecting');

    const socketFactory = () => new SockJS(`${environment.wsUrl}/ws`);
    const token = this.authService.getStoredToken();

    this.stompClient = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket server');
        this.connectionStatusSubject.next('connected');
        this.stompClient?.subscribe(`/user/${userId}/queue/messages`, (message: IMessage) => {
          this.messageSubject.next(JSON.parse(message.body));
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        this.connectionStatusSubject.next('error');
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.connectionStatusSubject.next('error');
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket server');
        this.connectionStatusSubject.next('disconnected');
      }
    });

    this.stompClient.activate();
  }

  sendMessage(senderId: string, receiverId: string, messageText: string): void {
    if (this.stompClient?.active) {
      const chatMessage = {
        senderId,
        receiverId,
        messageText
      };
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(chatMessage)
      });
    }
  }

  loadChatHistory(senderId: string, receiverId: string): Observable<ChatMessage[]> {
      // This is a placeholder. We need a real HTTP endpoint to fetch chat history.
      // I will create a dummy endpoint in ChatMessageController for this.
      // For now, I will return an empty array.
      // return this.http.get<ChatMessage[]>(`${environment.apiUrl}/v1/messages/${senderId}/${receiverId}`);
      const history = new Subject<ChatMessage[]>();
      history.next([]);
      return history.asObservable();
  }


  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
  }
}