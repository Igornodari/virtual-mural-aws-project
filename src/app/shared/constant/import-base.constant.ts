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
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
export { MaterialModule } from '../../../material.module';
export { CommonModule } from '@angular/common';
export { FormsModule, ReactiveFormsModule } from '@angular/forms';
export { MatNativeDateModule } from '@angular/material/core';
export { MatDatepickerModule } from '@angular/material/datepicker';
export { RouterModule } from '@angular/router';
export { TranslateModule } from '@ngx-translate/core';
export { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
export { LoadingComponent } from '../../components/loading.component';
export { StatusComponent } from '../../components/status.component';
export { RecordReadingComponent } from '../../components/record-reading.component';

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
