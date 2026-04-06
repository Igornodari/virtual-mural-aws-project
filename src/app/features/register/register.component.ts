import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import BaseComponent from '../../components/base.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
  ],
  templateUrl: './register.component.html',
  styles: [
    `
      .register-panel {
        width: 100%;
        max-width: 520px;
        margin-inline: auto;
      }
    `,
  ],
})
export class RegisterComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);

  awaitingConfirmation = false;
  registeredEmail = '';
  errorMessage = '';
  successMessage = '';

  registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  confirmationForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
  });

  constructor() {
    super();
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';

    const { firstName, lastName, email, password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.errorMessage = this.translateService.instant('APP.REGISTER.PASSWORDS_DO_NOT_MATCH');
      return;
    }

    this.setLoadingState(true);
    await this.authService
      .registerWithEmail(email, password, firstName, lastName)
      .finally(() => this.setLoadingState(false));
    this.registeredEmail = email;
    this.awaitingConfirmation = true;
    this.successMessage = this.translateService.instant('APP.REGISTER.ACCOUNT_CREATED');
  }

  async onConfirmCode(): Promise<void> {
    if (this.confirmationForm.invalid || !this.registeredEmail) return;

    this.errorMessage = '';
    this.setLoadingState(true);
    await this.authService
      .confirmEmailCode(this.registeredEmail, this.confirmationForm.getRawValue().code)
      .finally(() => this.setLoadingState(false));
    await this.navigateTo('/login');
  }
}
