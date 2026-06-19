import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { asset } from 'src/app/asset';
import { ConversationModeService } from 'src/app/services/conversation-mode';
import { UnityPlayerComponent } from 'src/app/shared/unity/unity';
import { Chat } from './sections/chat/chat';
import { Connections } from './sections/connections/connections';
import { LearningTargets } from './sections/learning-targets/learning-targets';

@Component({
  selector: 'app-learning-companion',
  standalone: true,
  templateUrl: './learning-companion.html',
  styleUrls: ['./learning-companion.css'],
  imports: [CommonModule, Chat, Connections, LearningTargets, UnityPlayerComponent],
})
export class LearningCompanion {
  asset = asset;

  private modeService = inject(ConversationModeService);

  /**
   * In Companion mode the Learning Progress column is hidden and the chat
   * is given the extra space so the conversation has room to breathe.
   */
  isCompanion = computed(() => this.modeService.current() === 'companion');
}
