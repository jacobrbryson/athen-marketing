import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningCompanion } from './learning-companion';

describe('LearningCompanion', () => {
  let component: LearningCompanion;
  let fixture: ComponentFixture<LearningCompanion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningCompanion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningCompanion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
