import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Notifications } from '../header.data';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { importBase } from 'src/app/shared/constant/import-base.constant';
@Component({
    selector: 'app-notification-item',
    templateUrl: './notification-item.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [importBase],
    styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent {
	@Input() notifications: Notifications[];
	@Input() photoUrl: string;
	@Output() notificationRead = new EventEmitter<void>();

	public notificationsCollection = new FirestoreService({ collectionName: 'notification' });
	constructor(public dialog: MatDialog) {}

	async markAsRead(notification: Notifications) {
		const dialogRef = this.dialog.open(NotificationDetailComponent, {
			data: notification,
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result === 'read') {
				this.notificationsCollection
					.updateNotification(notification.id, { isOpened: true })
					.then(() => {
						this.notificationsCollection.markAsRead(notification.id);
						notification.isOpened = true;
						this.notificationRead.emit();
					});
			}
		});
	}
}
