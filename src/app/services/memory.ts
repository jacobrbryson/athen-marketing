import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast';

export type MemoryCategory = 'interest' | 'subject' | 'pet' | 'family' | 'preference' | 'other';
export type MemoryVisibility = 'private' | 'family';

export interface MemoryItem {
  uuid: string;
  category: MemoryCategory;
  key: string;
  value: string | null;
  source: string;
  visibility: MemoryVisibility;
  confidence?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Memory foundation (Phase 7). Lightweight, structured facts about the
 * active user (interests, subjects, pets, family, preferences).
 */
@Injectable({ providedIn: 'root' })
export class MemoryService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.proxyServer}/api/v1/memory`;

  items = signal<MemoryItem[]>([]);
  loading = signal<boolean>(false);

  async load(): Promise<MemoryItem[]> {
    this.loading.set(true);
    try {
      const items = await firstValueFrom(this.http.get<MemoryItem[]>(this.base));
      this.items.set(items || []);
      return items || [];
    } catch (err) {
      console.error('MemoryService: load failed', err);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async upsert(payload: {
    category: MemoryCategory;
    key: string;
    value: string;
    visibility?: MemoryVisibility;
    source?: string;
  }): Promise<MemoryItem | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ memory: MemoryItem }>(this.base, payload)
      );
      await this.load();
      return res.memory;
    } catch (err: any) {
      console.error('MemoryService: upsert failed', err);
      this.toast.show(err?.error?.message || 'Unable to save memory.', 'error');
      return null;
    }
  }

  async remove(uuid: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.base}/${uuid}`));
      this.items.update((list) => list.filter((m) => m.uuid !== uuid));
      return true;
    } catch (err) {
      console.error('MemoryService: remove failed', err);
      return false;
    }
  }

  /** Parent view of a child's family-visible memories. */
  async loadChild(childUuid: string): Promise<MemoryItem[]> {
    try {
      return await firstValueFrom(
        this.http.get<MemoryItem[]>(
          `${environment.proxyServer}/api/v1/family/children/${childUuid}/memory`
        )
      );
    } catch (err) {
      console.error('MemoryService: loadChild failed', err);
      return [];
    }
  }
}
