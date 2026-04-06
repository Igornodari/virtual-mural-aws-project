import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

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
	],
	templateUrl: './dialog-action.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class AppDialogActionComponent {
	public description: string = '';
	public title: string = 'Atenção';
	public subTitle: string = 'Deseja prosseguir ?';
	public type: string = 'action';
	public descriptionRequerid = true;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<AppDialogActionComponent>
	) {
		this.type = this.data?.type ?? this.type;
		this.title = this.data?.title ?? this.title;
		this.subTitle = this.data?.subTitle ?? this.subTitle;
		this.description = this.data?.description ?? this.description;
		this.descriptionRequerid = this.data?.descriptionRequerid ?? this.descriptionRequerid;
	}

	onConfirm() {
		this.dialogRef.close({ description: this.description, ...this.data });
		return;
	}
}
