import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chat as ChatService } from 'src/app/services/chat'; // Import the new interface
import { UnityPlayerComponent } from 'src/app/shared/unity/unity';
import { ChatPreviewComponent } from './chat-preview/chat-preview';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, UnityPlayerComponent, ChatPreviewComponent],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat implements OnInit, OnDestroy {
  // Inject the new service
  private chatService = inject(ChatService);

  // Component state for UI interaction
  message = signal('');
  isSending = signal(false);

  // Expose service state to the template for display
  messages = this.chatService.messages;
  sessionId = this.chatService.sessionId;

  constructor() {}

  ngOnInit(): void {
    // Start the chat service initialization (session and connection)
    this.chatService.init();
  }

  ngOnDestroy(): void {
    // Delegate cleanup to the service
    this.chatService.close();
  }

  async sendMessage() {
    const text = this.message().trim();
    const currentSessionId = this.sessionId();

    // Check pre-requisites
    if (!text || this.isSending() || !currentSessionId) return;

    this.isSending.set(true);
    this.message.set(''); // Clear input immediately for better UX

    try {
      // Delegate sending the message to the service
      await this.chatService.sendMessage(text);
      // Real-time updates handled by the service's WebSocket listener
    } catch (err) {
      console.error('Failed to send message:', err);
      // In a production app, you would notify the user here
    } finally {
      this.isSending.set(false);
    }
  }
}
