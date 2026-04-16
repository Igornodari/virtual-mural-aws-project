import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';

export interface PaymentMethodData {
  appointmentId: string;
}

export type PaymentMethod = 'pix' | 'credit_card';

@Component({
  selector: 'app-payment-method-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    MatRadioModule,
    TranslateModule,
  ],
  templateUrl: './payment-method-dialog.html',
  styleUrl: './payment-method-dialog.scss',
})
export class PaymentMethodDialog {
  data = inject<PaymentMethodData>(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<PaymentMethodDialog>>(MatDialogRef);

  selectedMethod = signal<PaymentMethod>('pix');

  paymentMethods = [
    {
      value: 'pix' as PaymentMethod,
      label: 'PIX',
      description: 'Pagamento instantâneo via QR Code',
      icon: 'qr_code',
    },
    {
      value: 'credit_card' as PaymentMethod,
      label: 'Cartão de Crédito',
      description: 'Pagamento via cartão',
      icon: 'credit_card',
    },
  ];


  constructor() {}

  onConfirm() {
    if (!this.selectedMethod()) {
      return;
    }
    this.dialogRef.close(this.selectedMethod());
  }

  onCancel() {
    this.dialogRef.close();
  }
}
