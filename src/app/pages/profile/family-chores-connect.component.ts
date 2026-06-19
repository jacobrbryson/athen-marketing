import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FamilyChoresService, FamilyChoresStatus } from 'src/app/services/family-chores';
import { ToastService } from 'src/app/services/toast';

/**
 * "Connected apps" card for the Family Chores link. Lives on the self-profile
 * page. Connecting is initiated from the Family Chores app (a parent/admin
 * there authorizes it and Family Chores posts the token to Athena), so this
 * card shows connection status and offers disconnect — it does not generate
 * codes or take a token in the browser.
 */
@Component({
  selector: 'app-family-chores-connect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card blocklist-card">
      <div class="blocklist-header">
        <div>
          <p class="eyebrow">Connected apps</p>
          <p class="hint tight">
            Link Family Chores so you can ask Athena about your chores and coins.
          </p>
        </div>
      </div>

      <!-- Loading -->
      <p class="hint" *ngIf="loading()">Checking connection…</p>

      <ng-container *ngIf="!loading()">
        <!-- Connected -->
        <div *ngIf="status()?.connected; else notConnected" class="blocklist-list">
          <div class="blocked-row">
            <div class="blocked-meta">
              <p class="blocked-name">
                Family Chores connected{{ status()?.display_name ? ' · ' + status()?.display_name : '' }}
              </p>
              <p class="blocked-email" *ngIf="status()?.email">{{ status()?.email }}</p>
              <p class="blocked-date" *ngIf="status()?.player_id">
                Player ID: {{ status()?.player_id }}
              </p>
            </div>
            <div class="blocked-actions">
              <button
                type="button"
                (click)="disconnect()"
                [disabled]="busy()"
                class="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
            </div>
          </div>
          <p class="hint tight mt-2">
            Try asking Athena: “What chores do I have today?” or “How many coins do I have?”
          </p>
        </div>

        <!-- Not connected -->
        <ng-template #notConnected>
          <div class="empty">
            <p class="blocked-name">Not connected</p>
            <p class="hint">
              Open the <strong>Family Chores</strong> app and, as a parent, choose
              <strong>Connect Athena</strong>. We’ll link this account by email automatically —
              then refresh here to confirm.
            </p>
            <button
              type="button"
              (click)="refresh()"
              [disabled]="busy()"
              class="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ busy() ? 'Checking…' : 'Refresh status' }}
            </button>
          </div>
        </ng-template>
      </ng-container>
    </section>
  `,
})
export class FamilyChoresConnectComponent implements OnInit {
  private service = inject(FamilyChoresService);
  private toast = inject(ToastService);

  status = signal<FamilyChoresStatus | null>(null);
  loading = signal<boolean>(true);
  busy = signal<boolean>(false);

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    if (this.busy()) return;
    this.busy.set(true);
    this.loading.set(true);
    try {
      this.status.set(await this.service.getStatus());
    } finally {
      this.loading.set(false);
      this.busy.set(false);
    }
  }

  async disconnect() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const ok = await this.service.disconnect();
      if (ok) {
        this.toast.show('Family Chores disconnected.', 'success');
        this.status.set({ connected: false, provider: 'family_chores' });
      }
    } finally {
      this.busy.set(false);
    }
  }
}
