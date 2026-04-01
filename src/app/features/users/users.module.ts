import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { NgxMaskPipe, NgxMaskDirective, provideNgxMask } from "ngx-mask";
import { DisplayTableComponent } from "src/app/components/display-table.component";
import { ActivityComponent } from "src/app/components/historie-activity/activity.component";
import { LoadingComponent } from "src/app/components/loading.component";
import { MaterialModule } from "src/material.module";
import { UsersRoutes } from "./users.routing";
import { TableClientsComponent } from "./clients/table-clients/table-clients.component";


@NgModule({
	declarations: [
		TableClientsComponent,
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
