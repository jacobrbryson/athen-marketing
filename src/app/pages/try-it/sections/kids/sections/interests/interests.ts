import { Component, signal } from '@angular/core';

interface Lesson {
  id: number;
  title: string;
  summary: string;
}

@Component({
  selector: 'app-interests',
  imports: [],
  templateUrl: './interests.html',
  styleUrl: './interests.css',
})
export class Interests {
  athenaInterests = signal<string[]>(['Math', 'Science', 'History', 'Art', 'Programming']);

  recentLessons = signal<Lesson[]>([
    {
      id: 1,
      title: 'Fractions Explained',
      summary: 'You taught Athena about 1/2, 1/3, and 1/4 fractions.',
    },
    {
      id: 2,
      title: 'Reading Challenge',
      summary: 'Athena learned about the main idea of a short story.',
    },
    {
      id: 3,
      title: 'Solar System Basics',
      summary: 'You taught about planets and their order from the sun.',
    },
  ]);

  addLesson(lesson: Lesson) {
    this.recentLessons.update((lessons) => [lesson, ...lessons]);
  }

  addInterest(interest: string) {
    this.athenaInterests.update((list) => [...list, interest]);
  }
}
