import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
	template: `
		<h5 mat-dialog-title class="mat-subtitle-1">{{ title | translate }}</h5>
		<div
			mat-dialog-content
			class="mat-subtitle-2 lh-16"
			[innerHTML]="subTitle | translate | newLine"
		></div>
		<div mat-dialog-actions class="p-y-16 p-x-24" align="end">
			<button matButton="outlined" color="warn" mat-dialog-close>
				{{ 'CANCEL' | translate }}
			</button>
			<button
				matButton="filled"
				color="primary"
				mat-dialog-close
				cdkFocusInitial
				(click)="onConfirm()"
			>
				{{ 'CONFIRM' | translate }}
			</button>
		</div>
	`,
	encapsulation: ViewEncapsulation.None,
})
export class AppDialogConfirmationComponent {
	public title: string = 'DIALOG_COMPONENT.PROCEED.TITLE';
	public subTitle: string = 'DIALOG_COMPONENT.PROCEED.SUBTITLE';
	constructor(
		private _translate: TranslateService,
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
