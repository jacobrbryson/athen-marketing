import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LearningCompanion } from 'src/app/pages/dashboard/sections/learning-companion/learning-companion';
import { ProfileService } from 'src/app/services/profile';
import { Breadcrumb } from 'src/app/shared/breadcrumb/breadcrumb';
import { Parents } from 'src/app/pages/dashboard/sections/parents/parents';
import { Teachers } from 'src/app/pages/dashboard/sections/teachers/teachers';

type AdultTab = 'learning' | 'teacher' | 'parent';
type AdultTabRequirement = 'teacher' | 'parent';

const ADULT_TAB_LABELS: Record<AdultTab, string> = {
	learning: 'Learning Companion',
	teacher: 'Teacher',
	parent: 'Parent',
};

const ADULT_TAB_CONFIG: ReadonlyArray<{
	id: AdultTab;
	label: string;
	requires?: AdultTabRequirement;
}> = [
	{ id: 'learning', label: ADULT_TAB_LABELS.learning },
	{ id: 'teacher', label: ADULT_TAB_LABELS.teacher, requires: 'teacher' },
	{ id: 'parent', label: ADULT_TAB_LABELS.parent, requires: 'parent' },
];

const ADULT_TABS: ReadonlyArray<AdultTab> = ['learning', 'teacher', 'parent'];

const isAdultTab = (value: string | null): value is AdultTab => {
	return value !== null && ADULT_TABS.includes(value as AdultTab);
};

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [CommonModule, NgIf, LearningCompanion, Breadcrumb, Parents, Teachers],
	templateUrl: './dashboard.html',
	styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
	private router = inject(Router);
	private profileService = inject(ProfileService);

	private static readonly ADULT_TAB_STORAGE_KEY = "athena_dashboard_adult_tab";

	loading = signal<boolean>(true);
	viewMode = signal<'kid' | 'adult' | 'unknown'>('unknown');
	isTeacher = signal<boolean>(false);
	isParent = signal<boolean>(false);
	activeAdultTab = signal<AdultTab>('learning');
	adultTabs = computed(() =>
		ADULT_TAB_CONFIG.filter((tab) => {
			if (tab.requires === 'teacher') return this.isTeacher();
			if (tab.requires === 'parent') return this.isParent();
			return true;
		})
	);

	async ngOnInit() {
		await this.init();
	}

	private async init() {
		let profile = this.profileService.profile();

		if (!profile) {
			profile = await this.profileService.fetchProfile();
		}

		// If the profile could not be loaded, avoid redirect loops and stay put.
		if (!profile) {
			this.loading.set(false);
			return;
		}

		if (!profile.birthday) {
			this.redirectToProfile();
			return;
		}

		const age = this.computeAge(profile.birthday);

		// Missing valid age or required guardian flag for <13 -> redirect.
		if (age === null) {
			this.redirectToProfile();
			return;
		}

		if (age < 13 && !profile.has_guardian) {
			this.redirectToProfile();
			return;
		}

		if (age >= 18 && !(profile.is_guardian || profile.is_teacher)) {
			this.redirectToProfile();
			return;
		}

		this.isTeacher.set(Boolean(profile.is_teacher));
		this.isParent.set(Boolean(profile.is_guardian));

		const storedTab = this.getStoredAdultTab();
		const allowedTabs = this.adultTabs().map((tab) => tab.id);

		if (storedTab && allowedTabs.includes(storedTab)) {
			this.activeAdultTab.set(storedTab);
		} else if (this.isParent()) {
			this.activeAdultTab.set('parent');
		} else if (this.isTeacher()) {
			this.activeAdultTab.set('teacher');
		} else {
			this.activeAdultTab.set('learning');
		}

		this.viewMode.set(age < 18 ? 'kid' : 'adult');
		this.loading.set(false);
	}

	private computeAge(birthday: string): number | null {
		const birthDate = new Date(birthday);
		if (Number.isNaN(birthDate.getTime())) return null;
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}

	private redirectToProfile() {
		const profile = this.profileService.profile();
		const uuid = profile?.uuid || (profile as any)?.google_id;
		if (uuid) {
			this.router.navigate(['/dashboard/profile', uuid]);
			return;
		}
		this.router.navigate(['/profile']);
	}

	setAdultTab(role: AdultTab) {
		this.activeAdultTab.set(role);
		this.persistAdultTab(role);
	}

	private persistAdultTab(role: AdultTab) {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(
			Dashboard.ADULT_TAB_STORAGE_KEY,
			role
		);
	}

	private getStoredAdultTab(): AdultTab | null {
		if (typeof window === 'undefined') return null;
		const value = window.localStorage.getItem(
			Dashboard.ADULT_TAB_STORAGE_KEY
		);
		return isAdultTab(value) ? value : null;
	}

	breadcrumbLabel(): string {
		if (this.viewMode() === 'kid') {
			return ADULT_TAB_LABELS.learning;
		}

		if (this.viewMode() === 'adult') {
			return ADULT_TAB_LABELS[this.activeAdultTab()];
		}

		return 'Dashboard';
	}
}
