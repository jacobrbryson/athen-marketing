import { Component, signal } from '@angular/core';

interface Target {
  id: number;
  topic: string;
  proficiency: number; // Athena's current understanding/progress
}

@Component({
  selector: 'app-learning-targets',
  imports: [],
  templateUrl: './learning-targets.html',
  styleUrl: './learning-targets.css',
})
export class LearningTargets {
  // Signals for dynamic content
  wisdomPoints = signal<number>(120); // Example starting points

  learningTargets = signal<Target[]>([
    { id: 1, topic: 'Fractions', proficiency: 70 },
    { id: 2, topic: 'Reading Comprehension', proficiency: 50 },
    { id: 3, topic: 'Planets & Solar System', proficiency: 30 },
  ]);

  // Optional: Add methods to update points, targets, or interests
  addWisdomPoints(points: number) {
    this.wisdomPoints.update((current) => current + points);
  }

  updateTargetProficiency(targetId: number, newProficiency: number) {
    this.learningTargets.update((targets) =>
      targets.map((t) => (t.id === targetId ? { ...t, proficiency: newProficiency } : t))
    );
  }
}
