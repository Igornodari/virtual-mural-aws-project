import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PixQrDialog } from './pix-qr-dialog';

describe('PixQrDialog', () => {
  let component: PixQrDialog;
  let fixture: ComponentFixture<PixQrDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixQrDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PixQrDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
