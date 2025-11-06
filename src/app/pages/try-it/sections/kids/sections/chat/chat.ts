import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnityPlayerComponent } from '../../../../../../shared/unity/unity';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, UnityPlayerComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  message = signal('');

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.message.set(value);
  }

  inputValue = '';
  isSending = signal(false);

  constructor(private http: HttpClient) {}

  async sendMessage() {
    const text = this.message().trim();
    console.log(text);
    if (!text || this.isSending()) return;

    this.isSending.set(true);

    try {
      const res = await this.http
        .post('http://localhost:3000/api/public/chat', { message: text })
        .toPromise();

      console.log('Response:', res);
    } catch (err) {
      console.error(err);
    } finally {
      this.isSending.set(false);
      this.inputValue = '';
      this.message.set(''); // optional: keep your signal in sync
    }
  }
}
