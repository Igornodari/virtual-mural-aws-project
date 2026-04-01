import {
	Component,
	Output,
	EventEmitter,
	Input,
	ViewEncapsulation,
	OnInit,
	OnDestroy,
	Inject,
	DOCUMENT,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { NgScrollbarModule } from 'ngx-scrollbar';
import { AuthService } from 'src/app/services/auth.service';
import { Unit, User } from 'src/app/shared/types';
import { LanguageComponent } from './language.component';
import { SelectUnitsComponent } from './select-units.component';
import { profiledd, Notifications } from './header.data';
import { FirestoreService } from 'src/app/services/firestore.service';
import { MaterialModule } from 'src/app/material.module';
import { Subscription } from 'rxjs';
import { limit, orderBy, where } from '@angular/fire/firestore';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	encapsulation: ViewEncapsulation.None,
	imports: [
		TranslateModule,
		RouterModule,
		NgScrollbarModule,
		MaterialModule,
		LanguageComponent,
		SelectUnitsComponent,
		NotificationItemComponent,
	],
})
export class HeaderComponent implements OnInit, OnDestroy {
	production: boolean = environment.production;
	@Input() user: User;
	units: Array<Unit> = [];
	@Input() unit: Unit;
	@Input() showToggle = true;
	@Input() toggleChecked = false;
	@Output() toggleMobileNav = new EventEmitter<void>();
	@Output() toggleCollapsed = new EventEmitter<void>();

	public notificationsCollection = new FirestoreService({ collectionName: 'notification' });
	public notifications: Notifications[] = [];
	public profiledd = profiledd;
	categoryGroup: any[] = [];
	newNotificationsCount: number = 0;
	option = this.settings.getOptions();
	private notificationsSubscription: Subscription;

	constructor(
		public dialog: MatDialog,
		public authService: AuthService,
		private settings: CoreService,
		@Inject(DOCUMENT) private document: Document
	) {
	}

	ngOnInit(): void {
		this.initializeTheme();
		this.subscribeToNotifications();
		this.updateNewNotificationsCount();
	}

	initializeTheme(): void {
		if (this.option.theme === 'dark') {
			this.document.documentElement.classList.add('dark');
		} else {
			this.document.documentElement.classList.remove('dark');
		}
	}

	subscribeToNotifications() {
		const userId = this.user?.id;
		this.notificationsCollection.onSnapshotWithCondition(
			[limit(5), orderBy('createdAt', 'desc'), where('userId', '==', userId)],
			snapshot => {
				const newNotifications: Notifications[] = [];
				snapshot.docChanges().forEach(change => {
					const newNotification = {
						id: change.doc.id,
						...change.doc.data(),
					} as Notifications;
					if (change.type === 'added') {
						newNotifications.push(newNotification);
					}
				});

				this.notifications = [...newNotifications, ...this.notifications];

				const uniqueNotifications: Notifications[] = [];
				const notificationIds = new Set<string>();
				for (const notification of this.notifications) {
					if (!notificationIds.has(notification.id)) {
						notificationIds.add(notification.id);
						uniqueNotifications.push(notification);
					}
					if (uniqueNotifications.length === 5) {
						break;
					}
				}
				this.notifications = uniqueNotifications;

				this.sortNotifications();
				this.updateNewNotificationsCount();
			}
		);
	}

	sortNotifications() {
		this.notifications.sort((a, b) => {
			if (a.isOpened === b.isOpened) {
				return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
			}
			return a.isOpened ? 1 : -1;
		});
	}

	handleNotificationRead() {
		this.subscribeToNotifications();
	}

	async updateNewNotificationsCount() {
		const userId = this.user?.id;
		this.newNotificationsCount = await this.notificationsCollection.count([
			['userId', '==', userId],
			['isOpened', '==', false],
		]);
	}

	selectUnit(unit: Unit) {
		this.authService.setUnit(unit);
	}

	setDark() {
		this.option.theme = this.option.theme === 'dark' ? 'light' : 'dark';
		this.settings.setOptions(this.option);
		if (this.option.theme === 'dark') {
			this.document.documentElement.classList.add('dark');
		} else {
			this.document.documentElement.classList.remove('dark');
		}
	}

	ngOnDestroy(): void {
		if (this.notificationsSubscription) {
			this.notificationsSubscription.unsubscribe();
		}
	}
}
