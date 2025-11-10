import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Message {
  id: string | number;
  role: 'user' | 'athena' | 'system' | string;
  text: string;
  timestamp?: string | number; // optional ISO or epoch for display
}

@Injectable({
  providedIn: 'root',
})
export class Chat {
  // Dependencies injected using the modern 'inject' function
  private http = inject(HttpClient);

  // Public state exposed as signals
  messages = signal<Message[]>([]);
  sessionId = signal<string | null>(null);

  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;

  /**
   * Public initialization method called by the component.
   */
  async init() {
    await this.setSessionId();
  }

  /**
   * Fetches the current session ID, either from local storage or by requesting a new one.
   */
  private async setSessionId() {
    const storedId = localStorage.getItem('chatSessionId');

    try {
      const url = storedId
        ? `${environment.proxyServer}/api/v1/public/session?sessionId=${storedId}`
        : `${environment.proxyServer}/api/v1/public/session`;

      const res: any = await firstValueFrom(this.http.get(url));

      if (res?.sessionId) {
        this.sessionId.set(res.sessionId);
        localStorage.setItem('chatSessionId', res.sessionId);

        console.log('ChatService: Session set:', res.sessionId);

        // 1. Load the message history for the session
        await this.getMessages();

        // 2. Connect immediately once session is known
        this.connectWebSocket();
      } else {
        console.error('ChatService: API did not return a valid sessionId.');
      }
    } catch (err) {
      console.error('ChatService: Error fetching session ID:', err);
    }
  }

  /**
   * Fetches the message history for the current session ID.
   */
  private async getMessages() {
    const currentSessionId = this.sessionId();
    if (!currentSessionId) return;

    try {
      const url = `${environment.proxyServer}/api/v1/public/chat?sessionId=${currentSessionId}`;
      console.log('ChatService: Fetching message history:', url);

      const history: any[] = await firstValueFrom(this.http.get<any[]>(url));

      if (Array.isArray(history)) {
        // Update the signal with the fetched history
        this.messages.set(history);
        console.log(`ChatService: Loaded ${history.length} messages from history.`);
      } else {
        console.warn('ChatService: History endpoint did not return an array.');
      }
    } catch (err) {
      console.error('ChatService: Error fetching chat history:', err);
    }
  }

  /**
   * Sends a message to the chat API.
   * @param text The message content.
   */
  async sendMessage(text: string): Promise<any> {
    const currentSessionId = this.sessionId();
    if (!currentSessionId) {
      throw new Error('ChatService: Cannot send message, session ID is missing.');
    }

    try {
      const res = await firstValueFrom(
        this.http.post(`${environment.proxyServer}/api/v1/public/chat`, {
          message: text,
          sessionId: currentSessionId,
        })
      );
      console.log('ChatService: Send message response:', res);
      return res;
    } catch (err) {
      console.error('ChatService: Error sending message:', err);
      throw err;
    }
  }

  // --- WebSocket Logic ---

  private connectWebSocket() {
    const session = this.sessionId();
    if (!session) return;

    const wsUrl = environment.proxyServer.replace('http', 'ws') + `/ws?sessionId=${session}`;

    console.log('ChatService: Connecting WebSocket:', wsUrl);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('✅ ChatService: WebSocket connected');
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        // Update the messages signal array, triggering UI update
        this.messages.update((msgs) => [...msgs, msg]);
        console.log('📩 ChatService: Incoming WS message:', msg);
      } catch (err) {
        console.error('ChatService: Invalid JSON from WS:', err);
      }
    };

    this.ws.onclose = () => {
      console.warn('⚠️ ChatService: WebSocket closed, retrying in 2s...');
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('ChatService: WebSocket error:', err);
      this.ws?.close();
    };
  }

  /** Auto reconnect (lightweight) */
  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWebSocket();
    }, 2000);
  }

  /** Clean close, called by the component's ngOnDestroy */
  close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      console.log('ChatService: Closing WebSocket connection');
      this.ws.close();
      this.ws = null;
    }
  }
}
