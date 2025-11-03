import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Headline } from './headline';

describe('Headline', () => {
  let component: Headline;
  let fixture: ComponentFixture<Headline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Headline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Headline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
