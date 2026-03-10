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
	template: `
		<div class="p-x-20">
			<h2>{{ title | translate }}</h2>
			<p>{{ subTitle | translate }}</p>
		</div>
		<div mat-dialog-content class=" modal-sm ">
			<div class=" text-center">
				@if (type == 'info') {
				<p>{{ description }}</p>
				} @if (type == 'action') {
				<mat-label> {{ 'COMMENT' | translate }} </mat-label>
				<mat-form-field class="w-100 " appearance="outline">
					<textarea [(ngModel)]="description" matInput> </textarea>
				</mat-form-field>
				}
			</div>
		</div>
		<div mat-dialog-actions class="p-y-16 p-x-24" align="end">
			<button matButton="outlined" color="warn" mat-dialog-close>
				{{ 'CANCEL' | translate }}
			</button>
			@if (type == 'action') {
			<button
				matButton="filled"
				color="primary"
				(click)="onConfirm()"
				[mat-dialog-close]="true"
				[disabled]="!description && descriptionRequerid"
			>
				<mat-icon>download_done</mat-icon>
				{{ 'CONFIRM' | translate }}
			</button>
			}
		</div>
	`,
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
