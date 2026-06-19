import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { asset } from 'src/app/asset';
import { FamilyChoresService, FamilyChoresStatus } from 'src/app/services/family-chores';

/**
 * "Connections" section shown under the Athena companion. Lists the apps the
 * signed-in account is linked to. Today that's Family Chores; each connected
 * provider renders with its logo so kids can see at a glance what Athena can
 * reach. Connecting/disconnecting still happens on the profile page — this is
 * a read-only summary.
 */
@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connections.html',
  styleUrls: ['./connections.css'],
})
export class Connections implements OnInit {
  private familyChores = inject(FamilyChoresService);

  asset = asset;

  familyChoresStatus = signal<FamilyChoresStatus | null>(null);
  loading = signal<boolean>(true);

  async ngOnInit() {
    try {
      this.familyChoresStatus.set(await this.familyChores.getStatus());
    } finally {
      this.loading.set(false);
    }
  }
}
