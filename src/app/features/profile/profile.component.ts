import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import BaseComponent from '../../components/base.component';
import { OnboardingService } from '../../core/services/onboarding.service';
import { CreateCondominiumPayload } from '../../core/services/condominium-api.service';
import { AppUserProfileDto, UpdateProfilePayload } from '../../core/services/user-api.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPwd = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPwd && confirm && newPwd !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatCardModule, MatDividerModule,
    MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTabsModule,
    TranslateModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  isSavingPersonal = signal(false);
  isSavingAddress = signal(false);
  isLookingUpCep = signal(false);
  isSavingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  get isGoogleUser(): boolean {
    return this.user?.authProvider === 'google';
  }

  get currentRole(): 'provider' | 'customer' {
    return this.onboardingService.profile.role ?? 'customer';
  }

  personalForm = this.fb.nonNullable.group({
    givenName: ['', Validators.required],
    familyName: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  addressForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    zipCode: ['', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    neighborhood: [''],
    complement: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
  });

  passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  constructor() { super(); }

  ngOnInit(): void {
    this.loadCurrentData();
    this.loadProfileFromApi();
  }

  private loadCurrentData(): void {
    const u = this.user;
    if (u) {
      this.personalForm.patchValue({
        givenName: u.givenName ?? '',
        familyName: u.familyName ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
      });
    }
    const addr = this.onboardingService.profile.condominiumAddress;
    if (addr) {
      this.addressForm.patchValue(addr);
    }
  }

  private loadProfileFromApi(): void {
    this.userApi.getMe().subscribe({
      next: (me: AppUserProfileDto) => {
        this.personalForm.patchValue({
          givenName: me.givenName ?? '',
          familyName: me.familyName ?? '',
          email: me.email ?? '',
          phone: me.phone ?? '',
        });

        const condo = me.condominium;
        if (condo) {
          this.addressForm.patchValue({
            name: condo.name ?? this.addressForm.value.name ?? '',
            zipCode: condo.addressZipCode ?? this.addressForm.value.zipCode ?? '',
            street: condo.addressStreet ?? this.addressForm.value.street ?? '',
            number: condo.addressNumber ?? this.addressForm.value.number ?? '',
            complement: condo.addressComplement ?? this.addressForm.value.complement ?? '',
            neighborhood: condo.addressNeighborhood ?? this.addressForm.value.neighborhood ?? '',
            city: condo.addressCity ?? this.addressForm.value.city ?? '',
            state: condo.addressState ?? this.addressForm.value.state ?? '',
          });
        }
      }
    });
  }

  lookupCep(): void {
    const cep = this.addressForm.value.zipCode?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;
    this.isLookingUpCep.set(true);
    this.condominiumApi.lookupCep(cep).pipe(
      finalize(() => this.isLookingUpCep.set(false)),
    ).subscribe({
      next: (data) => {
        if (!data.erro) {
          this.addressForm.patchValue({
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          });
        }
      },
    });
  }

  savePersonal(): void {
    if (this.personalForm.invalid) return;
    this.isSavingPersonal.set(true);
    const formValue = this.personalForm.getRawValue();
    const payload: UpdateProfilePayload = {
      givenName: formValue.givenName,
      familyName: formValue.familyName,
      phone: formValue.phone,
    };

    this.userApi.updateProfile(payload).pipe(
      finalize(() => this.isSavingPersonal.set(false)),
    ).subscribe();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;
    this.isSavingAddress.set(true);
    const addr = this.addressForm.getRawValue();
    const payload: CreateCondominiumPayload = {
      name: addr.name,
      addressZipCode: addr.zipCode.replace(/\D/g, ''),
      addressStreet: addr.street,
      addressNumber: addr.number,
      addressComplement: addr.complement || undefined,
      addressNeighborhood: addr.neighborhood,
      addressCity: addr.city,
      addressState: addr.state,
    };
    const condominiumId = this.onboardingService.profile.condominiumId;
    const req = condominiumId
      ? this.condominiumApi.update(condominiumId, payload)
      : this.condominiumApi.create(payload);
    req.pipe(
      finalize(() => this.isSavingAddress.set(false)),
    ).subscribe({
      next: (condominium) => {
        const updatedCondominiumId =
          'id' in condominium ? condominium.id : this.onboardingService.profile.condominiumId;
        this.onboardingService.saveLocalCondominiumAddress(addr, updatedCondominiumId);
      },
    });
  }

  async savePassword(): Promise<void> {
    if (this.passwordForm.invalid) return;
    this.isSavingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue() as {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    };

    try {
      await this.authService.changePassword(currentPassword, newPassword);
      this.passwordSuccess.set(true);
      this.passwordForm.reset();
      const msg = this.translate.instant('APP.PROFILE.PASSWORD_CHANGED_SUCCESS');
      this.snackBar.open(msg, '✕', { duration: 4000, panelClass: 'snack-success' });
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name === 'NotAuthorizedException') {
        this.passwordError.set(this.translate.instant('APP.PROFILE.PASSWORD_WRONG_CURRENT'));
      } else if (e?.name === 'InvalidPasswordException' || e?.name === 'InvalidParameterException') {
        this.passwordError.set(this.translate.instant('APP.PROFILE.PASSWORD_INVALID'));
      } else if (e?.name === 'LimitExceededException') {
        this.passwordError.set(this.translate.instant('APP.PROFILE.PASSWORD_LIMIT_EXCEEDED'));
      } else {
        this.passwordError.set(e?.message ?? this.translate.instant('APP.FEEDBACK.UNEXPECTED_ERROR'));
      }
    } finally {
      this.isSavingPassword.set(false);
    }
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
