import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityLog } from '../../shared/types';
import { MatDialog } from '@angular/material/dialog';
import { ActivityModalComponent } from './activity-modal/activity-modal.component';
import { importBase } from '../../shared/constant/import-base.constant';
import { RequestService } from '../../core/services/request.service';

@Component({
  selector: 'app-activity',
  template: `
		<div class="col-12 d-flex justify-content-center m-t-20">
			<button matButton="outlined" color="primary" (click)="openActivityModal()">
				<mat-icon>history</mat-icon>
				{{ 'HISTORY_COMPONENT.SEE_HISTORY' | translate }}
			</button>
		</div>
	`,
  imports: [importBase],
})
export class ActivityComponent implements OnInit {
  @Input()
  table!: string;
  @Input()
  id!: string;
  @Input()
  $event!: EventEmitter<boolean>;
  activityLogs$!: Observable<ActivityLog[]>;

  constructor(private requestService: RequestService, private dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.$event) {
      this.$event.subscribe(() => this.fetchActivities());
    }
  }

  openActivityModal(): void {
    this.fetchActivities();
    this.activityLogs$.subscribe(logs => {
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
