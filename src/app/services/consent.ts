import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export type ConsentType = 'privacy_policy' | 'ai_disclosure' | 'terms_of_service';

export interface ConsentStatus {
  consents: Record<string, { accepted: boolean; document_version?: string; accepted_at?: string }>;
  privacy_accepted_at: string | null;
  ai_disclosure_accepted_at: string | null;
  all_required_accepted: boolean;
}

export interface ConsentEvent {
  consent_type: string;
  document_version: string;
  action: string;
  actor: string;
  created_at: string;
}

/** Current document versions; bump when policy text materially changes. */
export const CONSENT_VERSIONS: Record<ConsentType, string> = {
  privacy_policy: '2026-06-01',
  ai_disclosure: '2026-06-01',
  terms_of_service: '2026-06-01',
};

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private http = inject(HttpClient);
  private base = `${environment.proxyServer}/api/v1/consent`;

  status = signal<ConsentStatus | null>(null);

  async loadStatus(): Promise<ConsentStatus | null> {
    try {
      const status = await firstValueFrom(this.http.get<ConsentStatus>(`${this.base}/status`));
      this.status.set(status);
      return status;
    } catch (err) {
      console.error('ConsentService: loadStatus failed', err);
      return null;
    }
  }

  async accept(consentType: ConsentType): Promise<boolean> {
    try {
      const status = await firstValueFrom(
        this.http.post<ConsentStatus>(this.base, {
          consent_type: consentType,
          document_version: CONSENT_VERSIONS[consentType],
        })
      );
      this.status.set(status);
      return true;
    } catch (err) {
      console.error('ConsentService: accept failed', err);
      return false;
    }
  }

  async history(): Promise<ConsentEvent[]> {
    try {
      return await firstValueFrom(this.http.get<ConsentEvent[]>(`${this.base}/history`));
    } catch (err) {
      console.error('ConsentService: history failed', err);
      return [];
    }
  }
}
