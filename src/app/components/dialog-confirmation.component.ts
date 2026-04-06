import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { NewLine } from '../shared/pipe/new-line.pipe';

@Component({
	selector: 'app-diaog-action',
	imports: [
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		FormsModule,
		MatInputModule,
		MatButtonModule,
		TranslateModule,
		NewLine,
	],
	templateUrl: './dialog-confirmation.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class AppDialogConfirmationComponent {
	public title: string = 'DIALOG_COMPONENT.PROCEED.TITLE';
	public subTitle: string = 'DIALOG_COMPONENT.PROCEED.SUBTITLE';
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<AppDialogConfirmationComponent>
	) {
		this.title = this.data?.title ?? this.title;

		this.subTitle = this.data?.subTitle ?? this.subTitle;
	}

	onConfirm() {
		this.dialogRef.close(this.data);
		return;
	}
}
