import { Injectable, computed, signal } from '@angular/core';

/**
 * Tracks the currently *active* identity in the app.
 *
 * - A parent (Google account) is the default identity.
 * - A parent can switch into one of their children to view/troubleshoot
 *   the child experience (Phase 4). No separate Google account required.
 * - An independently logged-in child (QR / code) is also represented here.
 *
 * The active profile's `profileUuid` is used to bind chat sessions so each
 * child keeps a separate conversation history.
 */
export type ActiveProfileKind = 'parent' | 'child';

export interface ActiveProfile {
  kind: ActiveProfileKind;
  label: string;
  profileUuid: string | null; // null => parent's own IP-bound session
  childUuid?: string | null;
  avatar?: string | null;
}

const STORAGE_KEY = 'active_profile';

const PARENT_DEFAULT: ActiveProfile = {
  kind: 'parent',
  label: 'Parent',
  profileUuid: null,
};

@Injectable({ providedIn: 'root' })
export class ActiveProfileService {
  readonly active = signal<ActiveProfile>(this.restore());

  readonly isChild = computed(() => this.active().kind === 'child');
  readonly label = computed(() => this.active().label);

  private restore(): ActiveProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...PARENT_DEFAULT, ...JSON.parse(raw) };
    } catch {
      /* ignore malformed storage */
    }
    return { ...PARENT_DEFAULT };
  }

  private persist(profile: ActiveProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* storage may be unavailable */
    }
  }

  setParent(label = 'Parent'): void {
    const profile: ActiveProfile = { kind: 'parent', label, profileUuid: null };
    this.active.set(profile);
    this.persist(profile);
  }

  setChild(child: { profileUuid: string; childUuid?: string | null; label: string; avatar?: string | null }): void {
    const profile: ActiveProfile = {
      kind: 'child',
      label: child.label,
      profileUuid: child.profileUuid,
      childUuid: child.childUuid ?? null,
      avatar: child.avatar ?? null,
    };
    this.active.set(profile);
    this.persist(profile);
  }

  /** Stable per-identity key used to keep chat histories separate. */
  storageKey(): string {
    const p = this.active();
    return p.profileUuid ? `profile:${p.profileUuid}` : 'parent';
  }
}
