import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChildAuthService, ChildLoginCode } from 'src/app/services/child-auth';
import { ChildProfile, FamilyService } from 'src/app/services/family';
import { ToastService } from 'src/app/services/toast';
import { GRADE_OPTIONS } from 'src/app/shared/constants/grades';
import { ProfileSwitcher } from 'src/app/shared/profile-switcher/profile-switcher';
import { QrCode } from 'src/app/shared/qr-code/qr-code';

/**
 * Parent family-management surface (Phases 1, 3, 4). Add children, generate
 * QR / friendly login codes, revoke them, and switch into a child profile.
 */
@Component({
  selector: 'app-family-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProfileSwitcher, QrCode],
  templateUrl: './family-page.html',
})
export class FamilyPage implements OnInit {
  private family = inject(FamilyService);
  private childAuth = inject(ChildAuthService);
  private toast = inject(ToastService);

  grades = GRADE_OPTIONS;

  familySummary = this.family.family;
  children = this.family.children;
  loading = this.family.loading;

  // Add-child form
  newChildName = signal('');
  newChildGrade = signal('');
  addingChild = signal(false);

  // Per-child login codes, keyed by child uuid.
  codesByChild = signal<Record<string, ChildLoginCode[]>>({});
  expandedChild = signal<string | null>(null);
  generating = signal<string | null>(null);

  // Per-child Companion-mode permission (off by default; parent-controlled).
  companionByChild = signal<Record<string, boolean>>({});
  savingPermission = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.family.loadFamily();
    await this.loadPermissions();
  }

  /** Load each child's effective companion_mode flag so toggles reflect state. */
  private async loadPermissions(): Promise<void> {
    const entries = await Promise.all(
      this.children().map(async (c) => {
        const perms = await this.family.getPermissions(c.uuid);
        return [c.uuid, String(perms['companion_mode']).toLowerCase() === 'true'] as const;
      })
    );
    this.companionByChild.set(Object.fromEntries(entries));
  }

  companionEnabled(childUuid: string): boolean {
    return !!this.companionByChild()[childUuid];
  }

  async toggleCompanion(child: ChildProfile): Promise<void> {
    const next = !this.companionEnabled(child.uuid);
    this.savingPermission.set(child.uuid);
    const ok = await this.family.setPermission('companion_mode', String(next), child.uuid);
    this.savingPermission.set(null);
    if (ok) {
      this.companionByChild.update((m) => ({ ...m, [child.uuid]: next }));
      this.toast.show(
        next
          ? `Companion mode enabled for ${child.display_name}.`
          : `Companion mode disabled for ${child.display_name}.`,
        'success'
      );
    }
  }

  async addChild(): Promise<void> {
    const display_name = this.newChildName().trim();
    if (!display_name) return;
    this.addingChild.set(true);
    const child = await this.family.createChild({
      display_name,
      grade: this.newChildGrade() || undefined,
    } as any);
    this.addingChild.set(false);
    if (child) {
      this.newChildName.set('');
      this.newChildGrade.set('');
      this.toast.show(`${child.display_name} added.`, 'success');
    }
  }

  async toggleCodes(child: ChildProfile): Promise<void> {
    if (this.expandedChild() === child.uuid) {
      this.expandedChild.set(null);
      return;
    }
    this.expandedChild.set(child.uuid);
    await this.refreshCodes(child.uuid);
  }

  private async refreshCodes(childUuid: string): Promise<void> {
    const codes = await this.childAuth.listCodes(childUuid);
    this.codesByChild.update((map) => ({ ...map, [childUuid]: codes }));
  }

  async generate(child: ChildProfile, type: 'token' | 'qr'): Promise<void> {
    this.generating.set(child.uuid + type);
    const code = await this.childAuth.createCode(child.uuid, { code_type: type });
    this.generating.set(null);
    if (code) {
      await this.refreshCodes(child.uuid);
      this.toast.show(type === 'qr' ? 'QR code generated.' : `Code: ${code.code}`, 'success');
    }
  }

  async revoke(child: ChildProfile, code: ChildLoginCode): Promise<void> {
    const ok = await this.childAuth.revokeCode(child.uuid, code.uuid);
    if (ok) {
      await this.refreshCodes(child.uuid);
      this.toast.show('Code revoked.', 'success');
    }
  }

  loginUrl(code: string): string {
    return this.childAuth.buildLoginUrl(code);
  }

  copy(text: string): void {
    navigator.clipboard?.writeText(text).then(
      () => this.toast.show('Copied!', 'success'),
      () => this.toast.show('Could not copy.', 'error')
    );
  }

  codesFor(childUuid: string): ChildLoginCode[] {
    return this.codesByChild()[childUuid] || [];
  }
}
