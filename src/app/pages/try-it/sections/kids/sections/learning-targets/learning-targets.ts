import { Component, signal } from '@angular/core';

interface Target {
  id: number;
  topic: string;
  proficiency: number; // final value
  progressFill?: number; // animated value
}

@Component({
  selector: 'app-learning-targets',
  imports: [],
  templateUrl: './learning-targets.html',
  styleUrls: ['./learning-targets.css'],
})
export class LearningTargets {
  wisdomPoints = signal<number>(120);
  animatedWisdomPoints = signal<number>(0);

  learningTargets = signal<Target[]>([
    { id: 1, topic: 'Fractions', proficiency: 70, progressFill: 0 },
    { id: 2, topic: 'Reading Comprehension', proficiency: 50, progressFill: 0 },
    { id: 3, topic: 'Planets & Solar System', proficiency: 30, progressFill: 0 },
  ]);

  constructor() {
    this.animateWisdomPoints();
    this.animateProgressBars();
  }

  /** Smoothly animate wisdom points using requestAnimationFrame */
  animateWisdomPoints() {
    const duration = 1000; // total duration in ms
    const start = performance.now();
    const initial = 0;
    const target = this.wisdomPoints();

    const animate = (time: number) => {
      const elapsed = time - start;
      const t = Math.min(elapsed / duration, 1); // normalized 0..1
      const value = initial + (target - initial) * t; // linear interpolation
      this.animatedWisdomPoints.set(Math.floor(value));

      if (t < 1) requestAnimationFrame(animate);
      else this.animatedWisdomPoints.set(target); // ensure exact final value
    };

    requestAnimationFrame(animate);
  }

  /** Smoothly animate all progress bars */
  animateProgressBars() {
    const duration = 800;

    this.learningTargets().forEach((target) => {
      const initial = 0;
      const final = target.proficiency;
      const start = performance.now();

      const animate = (time: number) => {
        const elapsed = time - start;
        const t = Math.min(elapsed / duration, 1);
        target.progressFill = initial + (final - initial) * t;

        this.learningTargets.update((list) =>
          list.map((tgt) =>
            tgt.id === target.id ? { ...tgt, progressFill: target.progressFill } : tgt
          )
        );

        if (t < 1) requestAnimationFrame(animate);
        else target.progressFill = final;
      };

      requestAnimationFrame(animate);
    });
  }

  // Optional methods to update dynamically
  addWisdomPoints(points: number) {
    this.wisdomPoints.update((current) => current + points);
    this.animateWisdomPoints();
  }

  updateTargetProficiency(targetId: number, newProficiency: number) {
    this.learningTargets.update((targets) =>
      targets.map((t) => (t.id === targetId ? { ...t, proficiency: newProficiency } : t))
    );
    this.animateProgressBars();
  }
}
