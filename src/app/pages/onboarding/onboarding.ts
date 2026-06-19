import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsentService } from 'src/app/services/consent';
import { FamilyService } from 'src/app/services/family';
import { ToastService } from 'src/app/services/toast';
import { GRADE_OPTIONS } from 'src/app/shared/constants/grades';

/**
 * Parent consent & setup flow (Phase 2).
 * Steps: Welcome → Create Family → Privacy Policy → AI Disclosure →
 *        Create First Child → Complete.
 */
@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
})
export class Onboarding {
  private consent = inject(ConsentService);
  private family = inject(FamilyService);
  private toast = inject(ToastService);
  private router = inject(Router);

  grades = GRADE_OPTIONS;
  readonly totalSteps = 6;
  step = signal(1);
  busy = signal(false);

  // Form state
  familyName = signal('');
  privacyAccepted = signal(false);
  aiAccepted = signal(false);
  childName = signal('');
  childGrade = signal('');
  childBirthday = signal('');

  progress = computed(() => Math.round((this.step() / this.totalSteps) * 100));

  next() {
    this.step.update((s) => Math.min(s + 1, this.totalSteps));
  }
  back() {
    this.step.update((s) => Math.max(s - 1, 1));
  }

  async submitFamily() {
    const name = this.familyName().trim();
    if (!name) {
      this.toast.show('Please name your family.', 'error');
      return;
    }
    this.busy.set(true);
    const created = await this.family.createFamily(name);
    this.busy.set(false);
    if (created) this.next();
  }

  async acceptPrivacy() {
    this.busy.set(true);
    const ok = await this.consent.accept('privacy_policy');
    this.busy.set(false);
    if (ok) {
      this.privacyAccepted.set(true);
      this.next();
    } else {
      this.toast.show('Could not record your acceptance. Try again.', 'error');
    }
  }

  async acceptAi() {
    this.busy.set(true);
    const ok = await this.consent.accept('ai_disclosure');
    this.busy.set(false);
    if (ok) {
      this.aiAccepted.set(true);
      this.next();
    } else {
      this.toast.show('Could not record your acceptance. Try again.', 'error');
    }
  }

  async submitChild() {
    const display_name = this.childName().trim();
    if (!display_name) {
      this.toast.show('Please enter your child’s name.', 'error');
      return;
    }
    this.busy.set(true);
    const child = await this.family.createChild({
      display_name,
      grade: this.childGrade() || undefined,
      birthday: this.childBirthday() || undefined,
    } as any);
    this.busy.set(false);
    if (child) {
      this.toast.show(`${child.display_name} added!`, 'success');
      this.next();
    }
  }

  skipChild() {
    this.next();
  }

  finish() {
    this.router.navigateByUrl('/dashboard');
  }
}
