import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Unity } from './unity';

describe('Unity', () => {
  let component: Unity;
  let fixture: ComponentFixture<Unity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Unity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Unity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
