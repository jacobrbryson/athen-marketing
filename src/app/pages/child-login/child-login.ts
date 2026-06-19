import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActiveProfileService } from 'src/app/services/active-profile';
import { ChildAuthService } from 'src/app/services/child-auth';

/**
 * Child login (Phase 3). A child either scans a QR code (which deep-links
 * here with ?code=...) or types their friendly login code (e.g. SUNNY-APPLE).
 */
@Component({
  selector: 'app-child-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './child-login.html',
})
export class ChildLogin implements OnInit {
  private childAuth = inject(ChildAuthService);
  private activeProfile = inject(ActiveProfileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  code = signal('');
  busy = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const queryCode = this.route.snapshot.queryParamMap.get('code');
    if (queryCode) {
      this.code.set(queryCode);
      // Auto-submit when arriving via a scanned QR code.
      this.submit();
    }
  }

  setCode(value: string): void {
    this.code.set(value.toUpperCase());
    this.error.set(null);
  }

  async submit(): Promise<void> {
    const code = this.code().trim();
    if (!code || this.busy()) return;

    this.busy.set(true);
    this.error.set(null);
    try {
      const child = await this.childAuth.redeem(code);
      if (!child) {
        this.error.set('That code didn’t work. Ask a grown-up for a new one.');
        return;
      }
      this.activeProfile.setChild({
        profileUuid: child.profile_uuid,
        childUuid: child.child_uuid,
        label: child.display_name || 'Me',
      });
      this.router.navigateByUrl('/dashboard');
    } finally {
      this.busy.set(false);
    }
  }
}
