import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // ⚠️ IMPORTANT: In a real Angular application, this service
  // would typically manage a signal or subject that the main
  // application component subscribes to, triggering the display
  // of a toast component styled with Tailwind CSS.

  /**
   * Triggers a toast notification with the given message and type.
   * @param message The text to display in the toast.
   * @param type The type of toast (e.g., 'error', 'success').
   */
  show(message: string, type: 'error' | 'success' | 'warning' = 'error') {
    // For demonstration, we'll just log it.
    // In a real app, this would update a signal/state for the
    // toast component to render.
    console.log(`[Toast ${type.toUpperCase()}]: ${message}`);

    // You would replace the console.log with code to display the toast, e.g.:
    // this.toastSignal.set({ message, type, isVisible: true });

    // As a placeholder for the actual UI implementation:
    alert(`Error: ${message}`);
  }
}
