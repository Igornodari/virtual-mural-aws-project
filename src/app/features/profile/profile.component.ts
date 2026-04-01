import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../components/base.component';
import { MuralTopbarComponent } from '../../components/mural-topbar/mural-topbar.component';
import { OnboardingService } from '../../core/services/onboarding.service';
import { AppUserProfileDto, UpdateProfilePayload, UserApiService } from '../../core/services/user-api.service';
import { CondominiumApiService, CreateCondominiumPayload } from '../../core/services/condominium-api.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatCardModule, MatDividerModule,
    MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressSpinnerModule, MatTabsModule,
    TranslateModule, MuralTopbarComponent,
  ],
  template: `
    <div class="profile-layout">
      <app-mural-topbar
        [role]="currentRole"
        [userName]="user?.givenName || user?.displayName || ''"
        (logout)="onLogout()"
      />

      <main class="profile-main">
        <div class="profile-header">
          <div class="avatar-circle">
            <mat-icon class="avatar-icon">person</mat-icon>
          </div>
          <div>
            <h1 class="profile-name">{{ user?.givenName || user?.displayName }}</h1>
            <span class="role-badge" [class.role-badge--provider]="currentRole === 'provider'">
              <mat-icon class="role-icon">{{ currentRole === 'provider' ? 'storefront' : 'home' }}</mat-icon>
              {{ (currentRole === 'provider' ? 'APP.PROFILE.ROLE_PROVIDER' : 'APP.PROFILE.ROLE_CUSTOMER') | translate }}
            </span>
          </div>
        </div>

        <mat-tab-group animationDuration="200ms" class="profile-tabs">

          <!-- Aba: Dados Pessoais -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">person</mat-icon>
              {{ 'APP.PROFILE.TAB_PERSONAL' | translate }}
            </ng-template>
            <div class="tab-content">
              <mat-card class="surface-card">
                <mat-card-content>
                  <form [formGroup]="personalForm" (ngSubmit)="savePersonal()" class="profile-form">
                    <div class="two-col">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.PROFILE.GIVEN_NAME' | translate }}</mat-label>
                        <input matInput formControlName="givenName" />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.PROFILE.FAMILY_NAME' | translate }}</mat-label>
                        <input matInput formControlName="familyName" />
                      </mat-form-field>
                    </div>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>{{ 'APP.PROFILE.EMAIL' | translate }}</mat-label>
                      <input matInput formControlName="email" type="email" readonly />
                      <mat-icon matSuffix>email</mat-icon>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>{{ 'APP.PROFILE.PHONE' | translate }}</mat-label>
                      <input matInput formControlName="phone" type="tel"
                        [placeholder]="'APP.PROFILE.PHONE_PLACEHOLDER' | translate" />
                      <mat-icon matSuffix>phone</mat-icon>
                    </mat-form-field>
                    <div class="form-actions">
                      <button mat-raised-button color="primary" type="submit"
                        [disabled]="personalForm.invalid || isSavingPersonal()">
                        @if (isSavingPersonal()) { <mat-spinner diameter="18" /> }
                        <mat-icon>save</mat-icon>
                        {{ 'APP.PROFILE.SAVE' | translate }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Aba: Endereço e Condomínio -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">location_city</mat-icon>
              {{ 'APP.PROFILE.TAB_ADDRESS' | translate }}
            </ng-template>
            <div class="tab-content">
              <mat-card class="surface-card">
                <mat-card-content>
                  <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="profile-form">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>{{ 'APP.PROFILE.CONDO_NAME' | translate }}</mat-label>
                      <input matInput formControlName="name"
                        [placeholder]="'APP.PROFILE.CONDO_NAME_PLACEHOLDER' | translate" />
                      <mat-icon matSuffix>apartment</mat-icon>
                    </mat-form-field>
                    <div class="cep-row">
                      <mat-form-field appearance="outline" class="cep-field">
                        <mat-label>{{ 'APP.ONBOARDING.CONDOMINIUM.CEP' | translate }}</mat-label>
                        <input matInput formControlName="zipCode" maxlength="9"
                          [placeholder]="'APP.ONBOARDING.CONDOMINIUM.CEP_PLACEHOLDER' | translate"
                          (blur)="lookupCep()" />
                        <mat-icon matSuffix>pin_drop</mat-icon>
                        @if (isLookingUpCep()) { <mat-spinner matSuffix diameter="18" /> }
                      </mat-form-field>
                      <button mat-stroked-button type="button" (click)="lookupCep()"
                        [disabled]="isLookingUpCep()">
                        <mat-icon>search</mat-icon>
                        {{ 'APP.ONBOARDING.CONDOMINIUM.CEP_SEARCH' | translate }}
                      </button>
                    </div>
                    <div class="two-col">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.ONBOARDING.CONDOMINIUM.STREET' | translate }}</mat-label>
                        <input matInput formControlName="street" />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.ONBOARDING.CONDOMINIUM.NUMBER' | translate }}</mat-label>
                        <input matInput formControlName="number" />
                      </mat-form-field>
                    </div>
                    <div class="two-col">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.ONBOARDING.CONDOMINIUM.NEIGHBORHOOD' | translate }}</mat-label>
                        <input matInput formControlName="neighborhood" />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.ONBOARDING.CONDOMINIUM.COMPLEMENT' | translate }}</mat-label>
                        <input matInput formControlName="complement" />
                      </mat-form-field>
                    </div>
                    <div class="two-col">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.ONBOARDING.CONDOMINIUM.CITY' | translate }}</mat-label>
                        <input matInput formControlName="city" />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.ONBOARDING.CONDOMINIUM.STATE' | translate }}</mat-label>
                        <input matInput formControlName="state" maxlength="2" />
                      </mat-form-field>
                    </div>
                    <div class="form-actions">
                      <button mat-raised-button color="primary" type="submit"
                        [disabled]="addressForm.invalid || isSavingAddress()">
                        @if (isSavingAddress()) { <mat-spinner diameter="18" /> }
                        <mat-icon>save</mat-icon>
                        {{ 'APP.PROFILE.SAVE' | translate }}
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Aba: Segurança -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">security</mat-icon>
              {{ 'APP.PROFILE.TAB_SECURITY' | translate }}
            </ng-template>
            <div class="tab-content">
              <mat-card class="surface-card">
                <mat-card-content>
                  <div class="security-info">
                    <mat-icon class="security-icon">verified_user</mat-icon>
                    <div>
                      <p class="security-title">{{ 'APP.PROFILE.SECURITY_COGNITO_TITLE' | translate }}</p>
                      <p class="text-muted">{{ 'APP.PROFILE.SECURITY_COGNITO_DESC' | translate }}</p>
                    </div>
                  </div>
                  <mat-divider class="m-y-3" />
                  <div class="security-info">
                    <mat-icon class="security-icon">lock</mat-icon>
                    <div>
                      <p class="security-title">{{ 'APP.PROFILE.SECURITY_PASSWORD_TITLE' | translate }}</p>
                      <p class="text-muted">{{ 'APP.PROFILE.SECURITY_PASSWORD_DESC' | translate }}</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

        </mat-tab-group>
      </main>
    </div>
  `,
  styles: [`
    .profile-layout { min-height: 100vh; display: flex; flex-direction: column; }
    .profile-main {
      max-width: 800px; width: 100%; margin: 0 auto;
      padding: 32px 24px; display: flex; flex-direction: column; gap: 24px;
    }
    .profile-header { display: flex; align-items: center; gap: 20px; }
    .avatar-circle {
      width: 72px; height: 72px; border-radius: 50%;
      background: color-mix(in oklab, var(--mat-sys-primary) 15%, transparent);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .avatar-icon { font-size: 36px; width: 36px; height: 36px; color: var(--mat-sys-primary); }
    .profile-name { font-size: 22px; font-weight: 800; margin: 0 0 6px; }
    .role-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600;
      background: color-mix(in oklab, #0284c7 15%, transparent); color: #0284c7;
    }
    .role-badge--provider {
      background: color-mix(in oklab, #7c3aed 15%, transparent); color: #7c3aed;
    }
    .role-icon { font-size: 16px; width: 16px; height: 16px; }
    .profile-tabs { width: 100%; }
    .tab-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 6px; }
    .tab-content { padding: 24px 0; }
    .profile-form { display: flex; flex-direction: column; gap: 16px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cep-row { display: flex; gap: 12px; align-items: flex-start; }
    .cep-field { flex: 1; }
    .form-actions { display: flex; justify-content: flex-end; }
    .security-info { display: flex; align-items: flex-start; gap: 16px; padding: 12px 0; }
    .security-icon { font-size: 32px; width: 32px; height: 32px; color: var(--mat-sys-primary); flex-shrink: 0; }
    .security-title { font-weight: 700; margin: 0 0 4px; }
    @media (max-width: 600px) {
      .two-col { grid-template-columns: 1fr; }
      .cep-row { flex-direction: column; }
      .cep-row button { width: 100%; }
      .profile-main { padding: 16px; gap: 16px; }
      .profile-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .avatar-circle { width: 56px; height: 56px; }
      .avatar-icon { font-size: 28px; width: 28px; height: 28px; }
      .profile-name { font-size: 18px; }
      .form-actions { flex-direction: column; }
      .form-actions button { width: 100%; }
      .tab-content { padding: 16px 0; }
      .security-info { flex-direction: column; gap: 8px; }
    }
  `],
})
export class ProfileComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);
  private readonly userApi = inject(UserApiService);
  private readonly condominiumApi = inject(CondominiumApiService);

  isSavingPersonal = signal(false);
  isSavingAddress = signal(false);
  isLookingUpCep = signal(false);

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
      },
      error: () => {
        // Interceptor global já exibe feedback, aqui só evitamos quebrar a tela.
      },
    });
  }

  lookupCep(): void {
    const cep = this.addressForm.value.zipCode?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;
    this.isLookingUpCep.set(true);
    this.condominiumApi.lookupCep(cep).subscribe({
      next: (data) => {
        if (!data.erro) {
          this.addressForm.patchValue({
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          });
        }
        this.isLookingUpCep.set(false);
      },
      error: () => this.isLookingUpCep.set(false),
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

    this.userApi.updateProfile(payload).subscribe({
      next: () => {
        this.isSavingPersonal.set(false);
      },
      error: () => this.isSavingPersonal.set(false),
    });
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
    req.subscribe({
      next: (condominium) => {
        const updatedCondominiumId =
          'id' in condominium ? condominium.id : this.onboardingService.profile.condominiumId;
        this.onboardingService.saveLocalCondominiumAddress(addr, updatedCondominiumId);
        this.isSavingAddress.set(false);
      },
      error: () => this.isSavingAddress.set(false),
    });
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo(ROUTE_PATHS.login);
  }
}
