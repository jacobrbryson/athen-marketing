import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast';

export interface FamilySummary {
  uuid: string;
  name: string;
  subscription_plan: string;
  status: string;
  role?: string | null;
  created_at?: string;
}

export interface FamilyMember {
  role: string;
  display_name: string;
  full_name?: string;
  picture?: string | null;
  profile_uuid: string;
  status: string;
}

export interface ChildProfile {
  uuid: string;
  profile_uuid: string;
  display_name: string;
  avatar?: string | null;
  grade?: string | null;
  birthday?: string | null;
  status: string;
  wisdom_points?: number;
  level?: number | null;
  created_at?: string;
}

export interface FamilyContext {
  family: FamilySummary | null;
  members: FamilyMember[];
  children: ChildProfile[];
}

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.proxyServer}/api/v1/family`;

  family = signal<FamilySummary | null>(null);
  members = signal<FamilyMember[]>([]);
  children = signal<ChildProfile[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);

  async loadFamily(): Promise<FamilyContext | null> {
    this.loading.set(true);
    try {
      const ctx = await firstValueFrom(this.http.get<FamilyContext>(this.base));
      this.family.set(ctx.family);
      this.members.set(ctx.members || []);
      this.children.set(ctx.children || []);
      return ctx;
    } catch (err) {
      console.error('FamilyService: loadFamily failed', err);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async createFamily(name: string): Promise<FamilySummary | null> {
    this.saving.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<{ family: FamilySummary }>(this.base, { name })
      );
      this.family.set(res.family);
      return res.family;
    } catch (err) {
      console.error('FamilyService: createFamily failed', err);
      this.toast.show('Unable to create family right now.', 'error');
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  async createChild(payload: Partial<ChildProfile>): Promise<ChildProfile | null> {
    this.saving.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<{ child: ChildProfile }>(`${this.base}/children`, payload)
      );
      this.children.update((list) => [...list, res.child]);
      return res.child;
    } catch (err: any) {
      console.error('FamilyService: createChild failed', err);
      this.toast.show(err?.error?.message || 'Unable to add child.', 'error');
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  async loadChildren(): Promise<ChildProfile[]> {
    try {
      const children = await firstValueFrom(
        this.http.get<ChildProfile[]>(`${this.base}/children`)
      );
      this.children.set(children || []);
      return children || [];
    } catch (err) {
      console.error('FamilyService: loadChildren failed', err);
      return [];
    }
  }

  /** Phase 4: authorize a switch into a child profile; returns child identity. */
  async authorizeSwitch(childUuid: string): Promise<{
    profile_uuid: string;
    child_uuid: string;
    display_name: string;
  } | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ child: any }>(
          `${this.base}/children/${childUuid}/switch`,
          {}
        )
      );
      return res.child;
    } catch (err) {
      console.error('FamilyService: authorizeSwitch failed', err);
      this.toast.show('Unable to switch to that profile.', 'error');
      return null;
    }
  }

  async getPermissions(childUuid?: string): Promise<Record<string, string>> {
    try {
      const url = childUuid
        ? `${this.base}/permissions?child_uuid=${encodeURIComponent(childUuid)}`
        : `${this.base}/permissions`;
      const res = await firstValueFrom(
        this.http.get<{ effective: Record<string, string> }>(url)
      );
      return res.effective || {};
    } catch (err) {
      console.error('FamilyService: getPermissions failed', err);
      return {};
    }
  }

  async setPermission(key: string, value: string, childUuid?: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.put(`${this.base}/permissions`, {
          key,
          value,
          child_uuid: childUuid,
        })
      );
      return true;
    } catch (err) {
      console.error('FamilyService: setPermission failed', err);
      this.toast.show('Unable to update permission.', 'error');
      return false;
    }
  }
}
