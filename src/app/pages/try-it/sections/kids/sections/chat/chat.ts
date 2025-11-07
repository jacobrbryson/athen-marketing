import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnityPlayerComponent } from 'src/app/shared/unity/unity';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, UnityPlayerComponent],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'], // fix typo here
})
export class Chat {
  message = signal(''); // current input
  isSending = signal(false); // sending state

  constructor(private http: HttpClient) {}

  async sendMessage() {
    const text = this.message().trim();
    if (!text || this.isSending()) return;

    this.isSending.set(true);

    try {
      const res = await this.http
        .post(`${environment.proxyServer}/public/chat`, { message: text })
        .toPromise();

      console.log('Response:', res);
    } catch (err) {
      console.error(err);
    } finally {
      this.isSending.set(false);
      this.message.set('');
    }
  }
}
