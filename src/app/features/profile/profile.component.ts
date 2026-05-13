import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import BaseComponent from '../../components/base.component';
import { AppDialogConfirmationComponent } from '../../components/dialog-confirmation.component';
import { OnboardingService } from '../../core/services/onboarding.service';
import { CreateCondominiumPayload } from '../../core/services/condominium-api.service';
import { AppUserProfileDto, UpdateProfilePayload } from '../../core/services/user-api.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';
import { filter, switchMap } from 'rxjs/operators';
import { importBase } from 'src/app/shared/constant/import-base.constant';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPwd = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPwd && confirm && newPwd !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    importBase,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);

  isSavingPersonal = signal(false);
  isSavingAddress = signal(false);
  isLookingUpCep = signal(false);
  isSavingPassword = signal(false);
  isActivatingProvider = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  /** Reflete a flag opt-in. Sincroniza com o OnboardingService. */
  isProvider = signal(false);

  get isGoogleUser(): boolean {
    return this.user?.authProvider === 'google';
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
    this.onboardingService.profile$
      .subscribe((profile) => {
        this.isProvider.set(profile.isProvider);
      });
  }

  /**
   * Inicia o fluxo de ativação do modo prestador. Abre um diálogo
   * explicando o que muda (cadastro de serviços, recebimento de
   * pagamentos via Stripe) antes de confirmar. Após sucesso, navega
   * para o dashboard de prestador, onde o usuário pode configurar o
   * Stripe Connect se ainda não o fez.
   */
  becomeProvider(): void {
    const confirmRef = this.dialog.open(AppDialogConfirmationComponent, {
      data: {
        title: this.translateService.instant('PROFILE.BECOME_PROVIDER.DIALOG_TITLE'),
        subTitle: this.translateService.instant('PROFILE.BECOME_PROVIDER.DIALOG_BODY'),
      },
      width: '480px',
      maxWidth: '100vw',
      panelClass: 'responsive-dialog',
    });

    confirmRef
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.isActivatingProvider.set(true);
          return this.onboardingService.activateProvider();
        }),
      )
      .subscribe({
        next: (result) => {
          this.isActivatingProvider.set(false);
          if (result) {
            this.snackBar.success(
              this.translateService.instant('PROFILE.BECOME_PROVIDER.SUCCESS'),
            );
            this.navigateTo(ROUTE_PATHS.muralProvider);
          } else {
            this.snackBar.error(
              this.translateService.instant('PROFILE.BECOME_PROVIDER.ERROR'),
            );
          }
        },
        error: () => {
          this.isActivatingProvider.set(false);
          this.snackBar.error(
            this.translateService.instant('PROFILE.BECOME_PROVIDER.ERROR'),
          );
        },
      });
  }

  /** Atalho de navegação para o dashboard de prestador. */
  goToProviderDashboard(): void {
    this.navigateTo(ROUTE_PATHS.muralProvider);
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
      const msg = this.translateService.instant('PROFILE.SECURITY.PASSWORD_CHANGED_SUCCESS');
      this.snackBar.success(msg);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name === 'NotAuthorizedException') {
        this.passwordError.set(this.translateService.instant('PROFILE.SECURITY.PASSWORD_WRONG_CURRENT'));
      } else if (e?.name === 'InvalidPasswordException' || e?.name === 'InvalidParameterException') {
        this.passwordError.set(this.translateService.instant('PROFILE.SECURITY.PASSWORD_INVALID'));
      } else if (e?.name === 'LimitExceededException') {
        this.passwordError.set(this.translateService.instant('PROFILE.SECURITY.PASSWORD_LIMIT_EXCEEDED'));
      } else {
        this.passwordError.set(e?.message ?? this.translateService.instant('COMMON.FEEDBACK.UNEXPECTED_ERROR'));
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
