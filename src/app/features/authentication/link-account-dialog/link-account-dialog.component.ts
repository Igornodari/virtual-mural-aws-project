import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import BaseComponent from 'src/app/components/base.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';

@Component({
    selector: 'app-link-account-dialog',
    imports: [importBase],
    templateUrl: './link-account-dialog.component.html'
})
export class LinkAccountDialogComponent extends BaseComponent {

	constructor(
		public dialogRef: MatDialogRef<LinkAccountDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		super();
	}
}
