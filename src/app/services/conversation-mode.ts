import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ConversationMode {
  key: string;
  label: string;
  description?: string;
  is_active: boolean;
}

const STORAGE_KEY = 'conversation_mode';

/**
 * Conversation mode catalog (Phase 5). Modes are loaded from the API so new
 * modes can be added server-side without a client release.
 */
@Injectable({ providedIn: 'root' })
export class ConversationModeService {
  private http = inject(HttpClient);

  modes = signal<ConversationMode[]>([]);
  current = signal<string>(localStorage.getItem(STORAGE_KEY) || 'teach');

  /**
   * Mode keys the active profile is actually permitted to use, as told by the
   * /session endpoint (a child can't query its own permissions directly). An
   * empty list means "unknown / unrestricted" so the UI fails open until the
   * session loads.
   */
  allowedModes = signal<string[]>([]);

  setAllowedModes(keys: string[] | null | undefined): void {
    this.allowedModes.set(Array.isArray(keys) ? keys : []);
  }

  /** Whether the active profile may use the given mode. */
  isAllowed(modeKey: string): boolean {
    const allowed = this.allowedModes();
    return allowed.length === 0 || allowed.includes(modeKey);
  }

  async loadModes(): Promise<ConversationMode[]> {
    try {
      const modes = await firstValueFrom(
        this.http.get<ConversationMode[]>(`${environment.proxyServer}/api/v1/modes`)
      );
      this.modes.set(modes || []);
      // Ensure the current selection is still valid.
      if (modes?.length && !modes.some((m) => m.key === this.current())) {
        this.setCurrent(modes[0].key);
      }
      return modes;
    } catch (err) {
      console.error('ConversationModeService: loadModes failed', err);
      // Sensible offline fallback so the toggle still renders.
      const fallback: ConversationMode[] = [
        { key: 'teach', label: 'Teach Athena', is_active: true },
        { key: 'companion', label: 'Companion', is_active: true },
      ];
      this.modes.set(fallback);
      return fallback;
    }
  }

  setCurrent(mode: string): void {
    this.current.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }
}
