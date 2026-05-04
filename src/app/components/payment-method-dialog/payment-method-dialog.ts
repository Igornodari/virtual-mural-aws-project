import { Component, inject } from '@angular/core';
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

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  disabled?: boolean;
  disabledReason?: string;
}

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

  selectedMethod: PaymentMethod = 'credit_card';

  paymentMethods: PaymentMethodOption[] = [
    {
      value: 'credit_card',
      label: 'Cartão de Crédito',
      description: 'Pagamento seguro via cartão',
      icon: 'credit_card',
    },
    {
      value: 'pix',
      label: 'PIX',
      description: 'Em breve — aguardando ativação na conta Stripe',
      icon: 'qr_code',
      disabled: true,
      disabledReason: 'Disponível em breve',
    },
  ];

  onConfirm(): void {
    if (!this.selectedMethod) {
      return;
    }
    this.dialogRef.close(this.selectedMethod);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
