import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { moduleRoutes, Notifications } from '../../header.data';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { Router } from '@angular/router';

@Component({
	selector: 'app-notification-detail',
	providers: [provideNgxMask()],
	imports: [MatDialogModule, MatIconModule, MatButtonModule, DatePipe],
	templateUrl: './notification-detail.component.html',
})
export class NotificationDetailComponent {
	constructor(
		public dialogRef: MatDialogRef<NotificationDetailComponent>,
		@Inject(MAT_DIALOG_DATA) public data: Notifications,
		public router: Router
	) {}

	close(): void {
		this.dialogRef.close('read');
	}

	navigateToEvent(): void {
		const routeBase = moduleRoutes[this.data.module];
		if (routeBase) {
			const route = `/${routeBase}/${this.data.detailId}`;
			this.dialogRef.close('read');
			this.router.navigate([route]);
		} else {
			console.error('Rota não encontrada para o módulo:', this.data.module);
		}
	}

	openLink(link: string): void {
		if (link) {
			window.open(link, '_blank');
		}
	}
}
