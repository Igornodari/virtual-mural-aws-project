import { Component, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityLog } from '../../shared/types';
import { MatDialog } from '@angular/material/dialog';
import { ActivityModalComponent } from './activity-modal/activity-modal.component';
import { importBase } from '../../shared/constant/import-base.constant';
import { RequestService } from '../../core/services/request.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  imports: [...importBase],
})
export class ActivityComponent implements OnInit {
  private requestService = inject(RequestService);
  private dialog = inject(MatDialog);

  @Input()
  table!: string;
  @Input()
  id!: string;
  @Input()
  $event!: EventEmitter<boolean>;
  activityLogs$!: Observable<ActivityLog[]>;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    if (this.$event) {
      this.$event.subscribe(() => this.fetchActivities());
    }
  }

  openActivityModal(): void {
    this.fetchActivities();
    this.activityLogs$.subscribe((logs) => {
      this.dialog.open(ActivityModalComponent, {
        width: '800px',
        data: { activityLogs: logs },
      });
    });
  }

  fetchActivities(): void {
    this.activityLogs$ = this.requestService.getActivities(this.table, this.id);
  }
}
