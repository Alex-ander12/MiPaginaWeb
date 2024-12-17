import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GruposEstudioComponent } from './grupos-estudio.component';

describe('GruposEstudioComponent', () => {
  let component: GruposEstudioComponent;
  let fixture: ComponentFixture<GruposEstudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GruposEstudioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GruposEstudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
