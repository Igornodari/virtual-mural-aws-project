import { Component } from '@angular/core';
import {
	FormGroup,
	FormControl,
	Validators,
	FormsModule,
	ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { RouterModule } from '@angular/router';
import { LoadingComponent } from 'src/app/components/loading.component';
import { MaterialModule } from 'src/app/material.module';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	imports: [
		RouterModule,
		MaterialModule,
		FormsModule,
		ReactiveFormsModule,
		LoadingComponent,
		TranslateModule
	],
})
export class ForgotPasswordComponent {
	loading = false;
	send = false;

	constructor(
		private authService: AuthService,
		private _snackBar: SnackBarService,
		private translate: TranslateService
	) { }

	form = new FormGroup({
		email: new FormControl('', [Validators.required]),
	});

	get f() {
		return this.form.controls;
	}

	async submit() {
		this.loading = true;
		this.authService.forgotPassword(this.f['email'].value as string).subscribe({
			next: res => {
				this.loading = false;
				this.send = true;
				this._snackBar.success(this.translate.instant('LOGIN.FORGOT_PASSWORD.SUCCESS'));
			},
			error: res => {
				this.loading = false;
				this._snackBar.error(this.translate.instant('LOGIN.FORGOT_PASSWORD.ERROR'));
			},
		});
	}
}
