import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PaymentMethodDialog } from './payment-method-dialog';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('PaymentMethodDialog', () => {
  let component: PaymentMethodDialog;
  let fixture: ComponentFixture<PaymentMethodDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PaymentMethodDialog,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeLoader } }),
      ],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { appointmentId: 'appt1' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
