import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutes } from './users.routing';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from '../../components/loading.component';
import { TableClientsComponent } from './clients/table-clients/table-clients.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { TableLeadsComponent } from './leads/table-leads/table-leads.component';
import { ActivityComponent } from 'src/app/components/historie-activity/activity.component';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayTableComponent } from 'src/app/components/display-table.component';

@NgModule({
	declarations: [
		TableClientsComponent,
		TableLeadsComponent,
	],
	imports: [
		RouterModule.forChild(UsersRoutes),
		CommonModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		ActivityComponent,
		LoadingComponent,
		NgxMaskPipe,
		NgxMaskDirective,
		TranslateModule,
		DisplayTableComponent,
	],
	providers: [provideNgxMask()],
})
export class UsersModule { }
