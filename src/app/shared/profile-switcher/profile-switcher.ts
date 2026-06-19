import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActiveProfileService } from 'src/app/services/active-profile';
import { ChatService } from 'src/app/services/chat';
import { ChildProfile, FamilyService } from 'src/app/services/family';
import { ProfileService } from 'src/app/services/profile';

/**
 * Profile switcher (Phase 4). Lets a parent jump between their own view and
 * any child profile (to view/troubleshoot the child experience) with a
 * single click. Switching rebinds the chat session so histories stay
 * separate. Hidden for independently logged-in children.
 */
@Component({
  selector: 'app-profile-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-switcher.html',
})
export class ProfileSwitcher implements OnInit {
  private family = inject(FamilyService);
  private active = inject(ActiveProfileService);
  private chat = inject(ChatService);
  private profile = inject(ProfileService);

  open = signal(false);
  switching = signal(false);

  children = this.family.children;
  activeProfile = this.active.active;

  ngOnInit(): void {
    // Only parents manage multiple profiles; child sessions skip the fetch.
    if (this.active.active().kind === 'parent') {
      this.family.loadChildren();
    }
  }

  get parentLabel(): string {
    return this.profile.profile()?.full_name || 'Parent';
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  async switchToParent(): Promise<void> {
    this.open.set(false);
    if (this.activeProfile().kind === 'parent') return;
    this.active.setParent(this.parentLabel);
    await this.chat.reinitForActiveProfile();
  }

  async switchToChild(child: ChildProfile): Promise<void> {
    this.open.set(false);
    if (this.activeProfile().profileUuid === child.profile_uuid) return;
    this.switching.set(true);
    try {
      // Authorize the switch server-side, then rebind the active identity.
      const identity = await this.family.authorizeSwitch(child.uuid);
      if (!identity) return;
      this.active.setChild({
        profileUuid: identity.profile_uuid,
        childUuid: identity.child_uuid,
        label: identity.display_name || child.display_name,
        avatar: child.avatar,
      });
      await this.chat.reinitForActiveProfile();
    } finally {
      this.switching.set(false);
    }
  }
}
