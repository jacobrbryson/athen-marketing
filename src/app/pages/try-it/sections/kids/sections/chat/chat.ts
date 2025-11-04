import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { UnityPlayerComponent } from '../../../../../../shared/unity/unity';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, UnityPlayerComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }
}
