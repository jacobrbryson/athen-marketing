import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';
import { Message } from 'src/app/services/chat';

@Component({
  selector: 'app-chat-preview',
  standalone: true,
  imports: [CommonModule],
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
      // keep the last 100 messages
      this._messages = v.slice(-100);
    }
  }
  get messages(): Message[] {
    return this._messages;
  }

  drawerOpen = false;

  // computed preview text - latest athena response if available, otherwise latest message
  get previewText(): string {
    if (!this._messages || this._messages.length === 0) return 'No messages yet';
    // prefer last Athena message if present
    for (let i = this._messages.length - 1; i >= 0; i--) {
      const m = this._messages[i];
      if (m.role?.toLowerCase() === 'athena') return this.truncate(m.text);
    }
    // fallback to last message
    return this.truncate(this._messages[this._messages.length - 1].text);
  }

  // tiny truncation for preview
  private truncate(s: string, len = 80) {
    if (!s) return '';
    return s.length > len ? s.slice(0, len - 1).trim() + '…' : s;
  }

  openDrawer() {
    this.drawerOpen = true;
    // optional: lock body scroll when drawer is open on mobile
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    this.drawerOpen = false;
    document.body.style.overflow = '';
  }

  toggleDrawer() {
    this.drawerOpen ? this.closeDrawer() : this.openDrawer();
  }

  // close on escape key for accessibility
  @HostListener('window:keydown.esc')
  onEsc() {
    if (this.drawerOpen) this.closeDrawer();
  }

  // trackBy for ngFor performance
  trackById(index: number, item: Message) {
    return item.id ?? index;
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
