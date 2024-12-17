import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosAcademicosComponent } from './eventos-academicos.component';

describe('EventosAcademicosComponent', () => {
  let component: EventosAcademicosComponent;
  let fixture: ComponentFixture<EventosAcademicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosAcademicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
