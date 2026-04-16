import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityLog } from 'src/app/shared/types';
import BaseComponent from '../../base.component';
import { NewLine } from 'src/app/shared/pipe/new-line.pipe';

@Component({
  selector: 'app-activity-modal',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    NewLine,
    TranslateModule,
  ],
  templateUrl: './activity-modal.component.html',
  styleUrl: './activity-modal.component.scss',
})
export class ActivityModalComponent extends BaseComponent {
  dialogRef = inject<MatDialogRef<ActivityModalComponent>>(MatDialogRef);
  data = inject<{
    activityLogs: ActivityLog[];
  }>(MAT_DIALOG_DATA);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    super();
  }
}
