import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast';

export interface FamilyChoresStatus {
  connected: boolean;
  provider: string;
  display_name?: string | null;
  player_id?: string | null;
  email?: string | null;
  last_synced_at?: string | null;
  created_at?: string | null;
}

/**
 * Family Chores integration (account linking).
 *
 * Connecting is initiated from the Family Chores app: a Family Chores
 * parent/admin authorizes the link, and Family Chores' backend posts its
 * API token to Athena's connect endpoint. Athena matches (or creates) an
 * Athena account by email. This service only reads status and disconnects;
 * Athena never sees the Family Chores token in the browser.
 */
@Injectable({ providedIn: 'root' })
export class FamilyChoresService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.proxyServer}/api/v1/integrations/family-chores`;

  /** Current connection status for the signed-in user. */
  async getStatus(): Promise<FamilyChoresStatus> {
    try {
      return await firstValueFrom(this.http.get<FamilyChoresStatus>(this.base));
    } catch (err) {
      console.error('FamilyChoresService: getStatus failed', err);
      return { connected: false, provider: 'family_chores' };
    }
  }

  /** Disconnect the linked Family Chores account. */
  async disconnect(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(this.base));
      return true;
    } catch (err) {
      console.error('FamilyChoresService: disconnect failed', err);
      this.toast.show('Unable to disconnect Family Chores.', 'error');
      return false;
    }
  }
}
