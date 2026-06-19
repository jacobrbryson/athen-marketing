import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast';

export interface ChildLoginCode {
  uuid: string;
  code_type: 'token' | 'qr';
  code: string;
  label?: string | null;
  expires_at?: string | null;
  revoked?: boolean;
  expired?: boolean;
  active?: boolean;
  last_used_at?: string | null;
  use_count?: number;
  created_at?: string;
}

/**
 * Child authentication (Phase 3).
 *  - Parent side: generate / list / revoke login codes for a child.
 *  - Child side: redeem a code to obtain a child session token.
 */
@Injectable({ providedIn: 'root' })
export class ChildAuthService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.proxyServer}/api/v1`;

  async listCodes(childUuid: string): Promise<ChildLoginCode[]> {
    try {
      return await firstValueFrom(
        this.http.get<ChildLoginCode[]>(`${this.base}/family/children/${childUuid}/codes`)
      );
    } catch (err) {
      console.error('ChildAuthService: listCodes failed', err);
      return [];
    }
  }

  async createCode(
    childUuid: string,
    options: { code_type?: 'token' | 'qr'; expires_in_hours?: number; label?: string } = {}
  ): Promise<ChildLoginCode | null> {
    try {
      return await firstValueFrom(
        this.http.post<ChildLoginCode>(
          `${this.base}/family/children/${childUuid}/codes`,
          options
        )
      );
    } catch (err: any) {
      console.error('ChildAuthService: createCode failed', err);
      this.toast.show(err?.error?.message || 'Unable to generate code.', 'error');
      return null;
    }
  }

  async revokeCode(childUuid: string, codeUuid: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.base}/family/children/${childUuid}/codes/${codeUuid}`)
      );
      return true;
    } catch (err) {
      console.error('ChildAuthService: revokeCode failed', err);
      this.toast.show('Unable to revoke code.', 'error');
      return false;
    }
  }

  /** Build the deep-link a QR code should encode. */
  buildLoginUrl(code: string): string {
    return `${environment.siteUrl}/child-login?code=${encodeURIComponent(code)}`;
  }

  /** Child side: redeem a code for a child session token. */
  async redeem(code: string): Promise<{ profile_uuid: string; child_uuid: string; display_name: string } | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ jwt: string; child: any }>(`${this.base}/auth/child`, { code })
      );
      if (res?.jwt) {
        localStorage.setItem('auth_token', res.jwt);
        return res.child;
      }
      return null;
    } catch (err: any) {
      console.error('ChildAuthService: redeem failed', err);
      return null;
    }
  }
}
