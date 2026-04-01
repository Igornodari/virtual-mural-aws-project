import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

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
			{
				path: 'forgot-password',
				component: ForgotPasswordComponent,
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
		ForgotPasswordComponent,
	],
})
export class AuthenticationModule {}
