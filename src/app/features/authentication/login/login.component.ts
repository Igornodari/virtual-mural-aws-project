// login.component.ts (simplificado: mantém Google + email/senha; remove Microsoft e helpers)
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { importBase } from 'src/app/shared/constant/import-base.constant';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	imports: [NgOptimizedImage, importBase],
})
export class LoginComponent {
	loading = false;
	admin: string | null;

	public form: FormGroup<{
		username: FormControl<string>;
		password: FormControl<string>;
	}>;

	constructor(
		private authService: AuthService,
		private fb: FormBuilder,
		activatedRoute: ActivatedRoute,
		private snackBar: SnackBarService,
		private translate: TranslateService,
	) {
		this.form = this.fb.nonNullable.group({
			username: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(8)]],
		});

		this.admin = activatedRoute.snapshot.paramMap.get('admin');
	}

	get f() {
		return this.form.controls;
	}

	loginGoogle() {
		this.loading = true;

		this.authService
			.loginProviderGoogle()
			.then(() => (this.loading = false))
			.catch((error: any) => {
				this.loading = false;
				if (error?.code === 'auth/admin-restricted-operation') {
					this.snackBar.error(this.translate.instant('LOGIN.ERROR_NOT_REGISTERED'));
				} else {
					this.snackBar.error(this.translate.instant('LOGIN.ERROR_CONTACT_ADMIN'));
				}
			});
	}

	async submit() {
		if (this.form.invalid) return;

		this.loading = true;

		try {
			const email = this.f.username.value;
			const pass = this.f.password.value;

			if (this.admin) {
				(await this.authService.loginDev(email, pass)).add(() => (this.loading = false));
			} else {
				await this.authService.loginWithEmail(email, pass);
				this.loading = false;
			}
		} catch {
			this.loading = false;
			this.snackBar.error(this.translate.instant('LOGIN.ERROR_CONTACT_ADMIN'));
		}
	}
}
