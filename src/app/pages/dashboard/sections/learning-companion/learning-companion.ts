import { Component } from '@angular/core';
import { asset } from 'src/app/asset';
import { UnityPlayerComponent } from 'src/app/shared/unity/unity';
import { Chat } from './sections/chat/chat';
import { LearningTargets } from './sections/learning-targets/learning-targets';

@Component({
  selector: 'app-learning-companion',
  standalone: true,
  templateUrl: './learning-companion.html',
  styleUrls: ['./learning-companion.css'],
  imports: [Chat, LearningTargets, UnityPlayerComponent],
})
export class LearningCompanion {
  asset = asset;
}
