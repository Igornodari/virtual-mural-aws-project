import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { AppointmentDto } from 'src/app/core/services/appointment-api.service';
import { ServiceDto } from 'src/app/core/services/service-api.service';

import { CustomerServiceDetailsComponent } from './customer-service-details.component';

export interface CustomerServiceDetailsDialogData {
  readonly service: ServiceDto;
}

export type CustomerServiceDetailsDialogResult =
  | {
      type: 'appointmentCreated';
      appointment: AppointmentDto;
      service?: ServiceDto;
    }
  | {
      type: 'serviceUpdated';
      service: ServiceDto;
    };

@Component({
  selector: 'app-customer-service-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogTitle,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    CustomerServiceDetailsComponent,
  ],
  template: `
    <div class="cs-dialog__head">
      <h2 mat-dialog-title class="cs-dialog__title">
        {{ data.service.name }}
      </h2>

      <button
        mat-icon-button
        type="button"
        [attr.aria-label]="'COMMON.ACTIONS.CLOSE' | translate"
        (click)="close()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="cs-dialog__content">
      <app-customer-service-details
        [service]="data.service"
        (appointmentCreated)="onAppointmentCreated($event)"
        (serviceUpdated)="onServiceUpdated($event)"
      />
    </mat-dialog-content>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .cs-dialog__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 20px 0;
      }

      .cs-dialog__title {
        margin: 0;
        font-size: 1.05rem;
        line-height: 1.3;
        font-weight: 700;
        color: #1f2937;
      }

      .cs-dialog__content {
        padding: 12px 20px 20px;
      }
    `,
  ],
})
export class CustomerServiceDetailsDialog {
  readonly data = inject<CustomerServiceDetailsDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef = inject(
    MatDialogRef<
      CustomerServiceDetailsDialog,
      CustomerServiceDetailsDialogResult | undefined
    >,
  );

  private updatedService: ServiceDto | null = null;

  onAppointmentCreated(appointment: AppointmentDto): void {
    this.dialogRef.close({
      type: 'appointmentCreated',
      appointment,
      service: this.updatedService ?? undefined,
    });
  }

  onServiceUpdated(service: ServiceDto): void {
    this.updatedService = service;
  }

  close(): void {
    if (this.updatedService) {
      this.dialogRef.close({
        type: 'serviceUpdated',
        service: this.updatedService,
      });
      return;
    }

    this.dialogRef.close();
  }
}
