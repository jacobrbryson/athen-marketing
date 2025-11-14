import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  Signal,
  WritableSignal,
} from '@angular/core';
import { Message } from 'src/app/services/chat';
import { ChatInput } from '../../shared/chat-input/chat-input';

@Component({
  selector: 'app-chat-preview',
  standalone: true,
  imports: [CommonModule, ChatInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-preview.html',
  styleUrls: ['./chat-preview.css'],
})
export class ChatPreviewComponent {
  private _messages: Message[] = [];
  @Input()
  set messages(v: Message[] | null | undefined) {
    if (!v || !Array.isArray(v)) {
      this._messages = [];
    } else {
      this._messages = v.slice(-100);
    }
  }
  get messages(): Message[] {
    return this._messages;
  }

  drawerOpen = false;
  get isDrawerOpen(): boolean {
    return this.drawerOpen;
  }

  @Input({ required: true }) message!: WritableSignal<string>;
  @Input({ required: true }) isSending!: Signal<boolean>;
  @Input({ required: true }) sendMessage!: () => Promise<void>;
  @Input() isThinking: boolean = false;

  get previewText(): string {
    if (this.isThinking) {
      return 'Thinking...';
    }
    if (!this._messages || this._messages.length === 0) return 'No messages yet';

    console.log(this._messages);

    // Loop backwards from the last message
    for (let i = this._messages.length - 1; i >= 0; i--) {
      const m = this._messages[i];

      if (!m.is_human) {
        return this.truncate(m.text);
      }
    }

    return 'No message';
  }

  private truncate(s: string, len = 80) {
    if (!s) return '';
    return s.length > len ? s.slice(0, len - 1).trim() + '…' : s;
  }

  openDrawer() {
    this.drawerOpen = true; // optional: lock body scroll when drawer is open on mobile
    document.body.style.overflow = 'hidden'; // Optional: Auto-scroll to bottom/latest message when opening
    setTimeout(() => this.scrollToBottom(), 0);
  }

  closeDrawer() {
    this.drawerOpen = false;
    document.body.style.overflow = '';
  }

  toggleDrawer() {
    this.drawerOpen ? this.closeDrawer() : this.openDrawer();
  } // close on escape key for accessibility

  @HostListener('window:keydown.esc')
  onEsc() {
    if (this.drawerOpen) this.closeDrawer();
  } // Helper function to scroll to the end of the messages

  scrollToBottom() {
    const body = document.querySelector('.drawer-body');
    if (body) {
      // For bottom-up scrolling, we scroll to the bottom of the container.
      body.scrollTop = body.scrollHeight;
    }
  } // trackBy for ngFor performance

  trackById(index: number, item: Message) {
    return item.uuid ?? index;
  }

  formatTimestamp(ts?: string | number) {
    if (!ts) return '';
    try {
      const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
      return d.toLocaleString();
    } catch {
      return String(ts);
    }
  }
}
