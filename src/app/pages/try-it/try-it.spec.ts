import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryIt } from './try-it';

describe('TryIt', () => {
  let component: TryIt;
  let fixture: ComponentFixture<TryIt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TryIt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TryIt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
