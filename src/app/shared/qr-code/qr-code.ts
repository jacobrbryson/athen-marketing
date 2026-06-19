import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, signal } from '@angular/core';
import QRCode from 'qrcode';

/**
 * Renders a QR code locally (no third-party image service — important for a
 * kids product where the encoded login URL must not leak to external hosts).
 */
@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dataUrl()) {
    <img [src]="dataUrl()" [width]="size" [height]="size" alt="QR code" class="rounded-lg" />
    } @else {
    <div
      class="flex items-center justify-center bg-gray-100 rounded-lg text-xs text-gray-400"
      [style.width.px]="size"
      [style.height.px]="size"
    >
      …
    </div>
    }
  `,
})
export class QrCode implements OnChanges {
  @Input({ required: true }) data!: string;
  @Input() size = 180;

  dataUrl = signal<string | null>(null);

  async ngOnChanges(): Promise<void> {
    if (!this.data) {
      this.dataUrl.set(null);
      return;
    }
    try {
      const url = await QRCode.toDataURL(this.data, {
        width: this.size,
        margin: 1,
        color: { dark: '#3730a3', light: '#ffffff' },
      });
      this.dataUrl.set(url);
    } catch (err) {
      console.error('QrCode: failed to render', err);
      this.dataUrl.set(null);
    }
  }
}
