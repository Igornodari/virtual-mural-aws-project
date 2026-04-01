import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PAGES_ROUTES } from './pages.routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideEnvironmentNgxMask } from 'ngx-mask';
import { LoadingComponent } from '../components/loading.component';
import { MaterialModule } from 'src/material.module';

@NgModule({
	providers: [provideEnvironmentNgxMask()],
	imports: [
		CommonModule,
		MaterialModule,
		FormsModule,
		RouterModule.forChild(PAGES_ROUTES),
		ReactiveFormsModule,
		NgxMaskDirective,
		LoadingComponent,
	],
})
export class PagesModule {}
