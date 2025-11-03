import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-parents',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './parents.html',
  styleUrl: './parents.css',
})
export class Parents implements OnInit {
  children = signal([
    {
      id: 1,
      name: 'Sophia',
      gradeLevel: 'Grade 4',
      mood: 'Curious 😊',
      avgProgress: 82,
      focus: ['Math', 'Reading Comprehension'],
      targets: [
        { id: 1, topic: 'Fractions & Decimals', progress: 90 },
        { id: 2, topic: 'Reading Inference Skills', progress: 75 },
      ],
    },
    {
      id: 2,
      name: 'Ethan',
      gradeLevel: 'Grade 2',
      mood: 'Motivated 🚀',
      avgProgress: 68,
      focus: ['Writing', 'Social Studies'],
      targets: [
        { id: 3, topic: 'Creative Writing', progress: 70 },
        { id: 4, topic: 'US Geography', progress: 60 },
      ],
    },
  ]);

  selectedChildId = signal<number | null>(null);

  auditTrail = signal([
    {
      id: 1,
      activity: 'Athena provided feedback on Sophia’s reading goals',
      time: 'Today, 9:32 AM',
    },
    {
      id: 2,
      activity: 'Parent adjusted Ethan’s weekly focus to "Writing"',
      time: 'Yesterday, 7:14 PM',
    },
    { id: 3, activity: 'Sophia completed a math challenge session', time: '2 days ago, 5:30 PM' },
  ]);

  selectChild(id: number) {
    this.selectedChildId.set(id);
  }

  selectedChild() {
    return this.children().find((c) => c.id === this.selectedChildId()) ?? null;
  }

  ngOnInit() {
    this.selectChild(1);
  }
}
