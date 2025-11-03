import { Component, signal } from '@angular/core';
import { Kids } from './sections/kids/kids';
import { Parents } from './sections/parents/parents';
import { Teachers } from './sections/teachers/teachers';

@Component({
  selector: 'app-try-it',
  imports: [Kids, Parents, Teachers],
  templateUrl: './try-it.html',
  styleUrl: './try-it.css',
})
export class TryIt {
  // Use a signal to track the currently active role. Defaults to 'kid'.
  activeRole = signal<'kid' | 'parent' | 'teacher'>(this.getInitialRole());

  private getInitialRole(): 'kid' | 'parent' | 'teacher' {
    // Define the default and valid roles
    const DEFAULT_ROLE: 'kid' | 'parent' | 'teacher' = 'kid';
    const VALID_ROLES: ('kid' | 'parent' | 'teacher')[] = ['kid', 'parent', 'teacher'];

    // Check if running in a browser environment (safety check)
    if (typeof window === 'undefined') {
      return DEFAULT_ROLE;
    }

    // Read hash, strip the '#' and convert to lowercase
    const hash = window.location.hash.slice(1).toLowerCase();

    // Validate the hash against known roles
    if (VALID_ROLES.includes(hash as 'kid' | 'parent' | 'teacher')) {
      return hash as 'kid' | 'parent' | 'teacher';
    }

    return DEFAULT_ROLE;
  }

  /**
   * Switches the active role when a tab button is clicked and updates the URL hash.
   * @param role The role to switch to ('kid', 'parent', or 'teacher').
   */
  switchRole(role: 'kid' | 'parent' | 'teacher'): void {
    this.activeRole.set(role);

    if (typeof window !== 'undefined') {
      // 1. Manually update the URL hash
      window.location.hash = role;

      // 2. Manually scroll to the top of the page to fix the issue
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Dynamically generates the CSS classes for the tab buttons based on the active role.
   * @param role The role of the button being checked.
   * @returns A string of Tailwind classes.
   */
  getButtonClasses(role: 'kid' | 'parent' | 'teacher'): string {
    const baseClasses =
      'tab-button flex items-center px-6 py-3 rounded-xl font-semibold text-lg transition duration-300 space-x-2';

    if (this.activeRole() === role) {
      // Active state classes
      return `${baseClasses} bg-indigo-600 text-white shadow-md hover:shadow-lg hover:bg-indigo-700`;
    } else {
      // Inactive state classes
      return `${baseClasses} text-gray-600 hover:bg-gray-100`;
    }
  }
}
