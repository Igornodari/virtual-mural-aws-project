import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { LoadingComponent } from '../../components/loading.component';
import { StatusComponent } from '../../components/status.component';
import { RecordReadingComponent } from '../../components/record-reading.component';
import { MaterialModule } from '../../../material.module';

export const importBase = [
	MaterialModule,
	CommonModule,
	FormsModule,
	ReactiveFormsModule,
	NgxMaskDirective,
	NgxMaskPipe,
	LoadingComponent,
	MatDatepickerModule,
	MatNativeDateModule,
	RouterModule,
	StatusComponent,
	TranslateModule,
	RecordReadingComponent,
];
