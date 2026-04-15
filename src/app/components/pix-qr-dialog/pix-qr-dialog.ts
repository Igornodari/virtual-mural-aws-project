import { Component, ErrorHandler, Inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import * as QRCode from 'qrcode';

export interface PixQrData {
  qrCodeText: string;
  qrCode?: string;
}

@Component({
  selector: 'app-pix-qr-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './pix-qr-dialog.html',
  styleUrl: './pix-qr-dialog.scss',
})
export class PixQrDialog implements OnInit {
  qrCodeUrl = signal<string>('');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PixQrData,
    public dialogRef: MatDialogRef<PixQrDialog>,
    private readonly errorHandler: ErrorHandler,
  ) {}

  async ngOnInit() {
    if (this.data.qrCode) {
      this.qrCodeUrl.set(this.data.qrCode);
    } else if (this.data.qrCodeText) {
      try {
        const url = await QRCode.toDataURL(this.data.qrCodeText);
        this.qrCodeUrl.set(url);
      } catch (error) {
        this.errorHandler.handleError(error);
      }
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
