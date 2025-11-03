import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeHowAthenaLearns } from './see-how-athena-learns';

describe('SeeHowAthenaLearns', () => {
  let component: SeeHowAthenaLearns;
  let fixture: ComponentFixture<SeeHowAthenaLearns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeeHowAthenaLearns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeeHowAthenaLearns);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
