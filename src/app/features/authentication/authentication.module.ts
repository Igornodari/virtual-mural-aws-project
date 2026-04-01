import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Routes, RouterModule } from "@angular/router";
import { AppErrorComponent } from "./error/error.component";
import { LoginComponent } from "./login/login.component";


export const AuthenticationRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: '404',
				component: AppErrorComponent,
			},
			{
				path: 'login',
				component: LoginComponent,
			},
			{
				path: 'login/:admin',
				component: LoginComponent,
			},
		],
	},
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(AuthenticationRoutes),
		MatIconModule,
		MatCardModule,
		MatInputModule,
		MatCheckboxModule,
		MatButtonModule,
		FormsModule,
		ReactiveFormsModule,
		AppErrorComponent,
		LoginComponent,
	],
})
export class AuthenticationModule {}
