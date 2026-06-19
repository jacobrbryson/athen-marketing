import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  Signal,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { ChatService } from 'src/app/services/chat';
import { ConversationModeService } from 'src/app/services/conversation-mode';
import { VoiceInputService } from 'src/app/services/voice';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-input.html',
  styleUrls: ['./chat-input.css'],
})
export class ChatInput implements OnInit {
  @ViewChild('messageInput') inputElement!: ElementRef<HTMLInputElement>;
  @Input({ required: true }) message!: WritableSignal<string>;
  @Input({ required: true }) sendMessage!: () => Promise<void>;

  private chat = inject(ChatService);
  private modeService = inject(ConversationModeService);
  voice = inject(VoiceInputService);

  isSendingInternal = signal(false);

  // Mode switcher (Phase 5)
  modes = this.modeService.modes;
  currentMode = this.modeService.current;

  /** Whether the active profile is permitted to use this mode. */
  canUseMode(modeKey: string): boolean {
    return this.modeService.isAllowed(modeKey);
  }

  /** Tooltip for a mode button, noting when it's locked by a parent. */
  modeTitle(m: { key: string; label: string; description?: string }): string {
    if (!this.canUseMode(m.key)) {
      return `${m.label} is turned off. Ask a parent to enable it.`;
    }
    return m.description || m.label;
  }

  // Voice (Phase 6)
  voiceSupported = signal(false);

  ngOnInit(): void {
    this.voiceSupported.set(this.voice.isSupported());
  }

  @Input({ required: true }) set isSending(value: Signal<boolean>) {
    const wasSending = this.isSendingInternal();
    this.isSendingInternal.set(value());
    if (wasSending && !value()) {
      setTimeout(() => {
        this.inputElement.nativeElement.focus();
      }, 0);
    }
  }

  get isSending() {
    return this.isSendingInternal.asReadonly();
  }

  public focusInput() {
    this.inputElement.nativeElement.focus();
  }

  selectMode(mode: string): void {
    if (mode === this.currentMode()) return;
    if (!this.canUseMode(mode)) return;
    this.chat.changeMode(mode);
  }

  placeholder(): string {
    return this.currentMode() === 'companion'
      ? 'Chat with Athena…'
      : 'Teach Athena something new…';
  }

  // --- Push-to-talk ---
  startVoice(event: Event): void {
    event.preventDefault();
    if (!this.voiceSupported()) return;
    this.voice.start((text) => {
      const existing = this.message().trim();
      this.message.set(existing ? `${existing} ${text}` : text);
      this.focusInput();
    });
  }

  stopVoice(): void {
    this.voice.stop();
  }
}
