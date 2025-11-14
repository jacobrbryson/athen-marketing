import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-input.html',
  styleUrls: ['./chat-input.css'], // Assuming you'll create this file
})
export class ChatInput {
  // Inputs for state management (Signals passed from the parent)
  @Input({ required: true }) message!: WritableSignal<string>;
  @Input({ required: true }) isSending!: Signal<boolean>;

  // Input for the action (Function passed from the parent)
  @Input({ required: true }) sendMessage!: () => Promise<void>;
}
