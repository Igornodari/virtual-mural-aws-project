import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PixQrDialog } from './pix-qr-dialog';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('PixQrDialog', () => {
  let component: PixQrDialog;
  let fixture: ComponentFixture<PixQrDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PixQrDialog,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeLoader } }),
      ],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { qrCodeText: '00020101021226...', qrCode: 'base64data' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PixQrDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have qrCodeText from dialog data', () => {
    expect(component.data.qrCodeText).toBe('00020101021226...');
  });
});
