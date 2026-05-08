import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MuralAppointmentsPageComponent } from './appointments-page.component';

describe('MuralAppointmentsPageComponent', () => {
  let component: MuralAppointmentsPageComponent;
  let fixture: ComponentFixture<MuralAppointmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuralAppointmentsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MuralAppointmentsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
