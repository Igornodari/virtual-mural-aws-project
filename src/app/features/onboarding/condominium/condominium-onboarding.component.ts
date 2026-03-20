import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../../components/base.component';
import { CondominiumApiService, ViaCepResponse } from '../../../core/services/condominium-api.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { ROUTE_PATHS } from '../../../shared/constant/route-paths.constant';
import { CondominiumAddress } from '../../../shared/types';
import { importBase } from 'src/app/shared/constant/import-base.constant';

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

function cepValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString().replace(/\D/g, '');
  return raw.length === 8 ? null : { invalidCep: true };
}

@Component({
  selector: 'app-condominium-onboarding',
  standalone: true,
  imports: [...importBase],
  template: `
    <div class="app-auth-page">
      <div class="onboarding-shell">
        <div class="onboarding-header">
          <span class="app-badge">{{ 'APP.TOPBAR.BRAND' | translate }}</span>
          <h1 class="m-t-3 m-b-1">{{ 'APP.ONBOARDING.CONDO_TITLE' | translate }}</h1>
          <p class="text-muted m-0">{{ 'APP.ONBOARDING.CONDO_SUBTITLE' | translate }}</p>
        </div>

        <mat-card class="surface-card--elevated onboarding-card">
          <mat-card-content class="p-0">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="d-flex flex-col gap-4">
              <div class="cep-row">
                <mat-form-field appearance="outline" class="cep-field">
                  <mat-label>{{ 'APP.PROFILE.FIELD_CEP' | translate }}</mat-label>
                  <input
                    matInput
                    formControlName="zipCode"
                    placeholder="00000-000"
                    maxlength="9"
                    inputmode="numeric"
                    (input)="onCepInput($event)"
                  />
                  @if (loadingCep) {
                    <mat-spinner matSuffix diameter="20"></mat-spinner>
                  }
                  @if (form.controls.zipCode.touched && form.controls.zipCode.invalid) {
                    <mat-error>{{ 'APP.ONBOARDING.CEP_INVALID' | translate }}</mat-error>
                  }
                </mat-form-field>

                <button
                  mat-stroked-button
                  type="button"
                  class="cep-btn"
                  [disabled]="form.controls.zipCode.invalid || loadingCep"
                  (click)="fetchAddress()"
                >
                  <mat-icon>search</mat-icon>
                  {{ 'APP.PROFILE.SEARCH_CEP' | translate }}
                </button>
              </div>

              @if (cepError) {
                <div class="app-error-box">{{ cepError }}</div>
              }

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>{{ 'APP.PROFILE.FIELD_STREET' | translate }}</mat-label>
                <input matInput formControlName="street" placeholder="Ex: Rua das Flores" />
                @if (form.controls.street.touched && form.controls.street.invalid) {
                  <mat-error>{{ 'APP.ONBOARDING.STREET_REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <div class="two-col">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.PROFILE.FIELD_NUMBER' | translate }}</mat-label>
                  <input matInput formControlName="number" placeholder="Ex: 123" inputmode="numeric" />
                  @if (form.controls.number.touched && form.controls.number.invalid) {
                    <mat-error>{{ 'APP.ONBOARDING.NUMBER_REQUIRED' | translate }}</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.PROFILE.FIELD_COMPLEMENT' | translate }}</mat-label>
                  <input matInput formControlName="complement" placeholder="Apto, Bloco..." />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>{{ 'APP.PROFILE.FIELD_NEIGHBORHOOD' | translate }}</mat-label>
                <input matInput formControlName="neighborhood" placeholder="Ex: Centro" />
                @if (form.controls.neighborhood.touched && form.controls.neighborhood.invalid) {
                  <mat-error>{{ 'APP.ONBOARDING.NEIGHBORHOOD_REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <div class="two-col">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.PROFILE.FIELD_CITY' | translate }}</mat-label>
                  <input matInput formControlName="city" placeholder="Ex: Sao Paulo" />
                  @if (form.controls.city.touched && form.controls.city.invalid) {
                    <mat-error>{{ 'APP.ONBOARDING.CITY_REQUIRED' | translate }}</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.PROFILE.FIELD_STATE' | translate }}</mat-label>
                  <mat-select formControlName="state">
                    @for (uf of states; track uf) {
                      <mat-option [value]="uf">{{ uf }}</mat-option>
                    }
                  </mat-select>
                  @if (form.controls.state.touched && form.controls.state.invalid) {
                    <mat-error>{{ 'APP.ONBOARDING.STATE_REQUIRED' | translate }}</mat-error>
                  }
                </mat-form-field>
              </div>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full m-t-2"
                [disabled]="form.invalid || loading"
              >
                @if (loading) {
                  <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                } @else {
                  {{ 'APP.ONBOARDING.CONTINUE' | translate }}
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-shell {
      width: min(520px, 100%);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .onboarding-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .onboarding-card {
      padding: 32px;
    }
    .cep-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .cep-field {
      flex: 1;
      min-width: 160px;
    }
    .cep-btn {
      margin-top: 4px;
      height: 56px;
      white-space: nowrap;
      flex-shrink: 0;
      gap: 4px;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .btn-spinner {
      display: inline-block;
    }
    @media (max-width: 600px) {
      .onboarding-card {
        padding: 20px 16px;
      }
      .two-col {
        grid-template-columns: 1fr;
      }
      .cep-row {
        flex-direction: column;
      }
      .cep-field {
        min-width: unset;
        width: 100%;
      }
      .cep-btn {
        width: 100%;
        margin-top: 0;
        height: 48px;
      }
    }
  `],
})
export class CondominiumOnboardingComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly condominiumApi = inject(CondominiumApiService);
  private readonly onboardingService = inject(OnboardingService);

  readonly states = BRAZIL_STATES;

  loadingCep = false;
  cepError = '';

  form = this.fb.nonNullable.group({
    zipCode: ['', [Validators.required, cepValidator]],
    street: ['', Validators.required],
    number: ['', Validators.required],
    complement: [''],
    neighborhood: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
  });

  constructor() {
    super();
  }

  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }

    this.form.controls.zipCode.setValue(value, { emitEvent: false });
    input.value = value;
    this.cepError = '';
  }

  fetchAddress(): void {
    const raw = this.form.controls.zipCode.value.replace(/\D/g, '');
    if (raw.length !== 8) {
      return;
    }

    this.loadingCep = true;
    this.cepError = '';

    this.condominiumApi.lookupCep(raw).subscribe({
      next: (data: ViaCepResponse) => {
        this.loadingCep = false;

        if (data.erro) {
          this.cepError = 'CEP nao encontrado. Preencha o endereco manualmente.';
          return;
        }

        this.form.patchValue({
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        });
      },
      error: () => {
        this.loadingCep = false;
        this.cepError = 'Nao foi possivel consultar o CEP agora. Preencha o endereco manualmente.';
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.setLoadingState(true);
    const raw = this.form.getRawValue();

    const address: CondominiumAddress = {
      zipCode: raw.zipCode.replace(/\D/g, ''),
      street: raw.street,
      number: raw.number,
      complement: raw.complement || undefined,
      neighborhood: raw.neighborhood,
      city: raw.city,
      state: raw.state,
    };

    this.onboardingService.ensureCondominiumRegistration(address).subscribe({
      next: () => {
        this.setLoadingState(false);
        this.navigateTo(ROUTE_PATHS.onboardingRole);
      },
      error: () => {
        this.setLoadingState(false);
        this.navigateTo(ROUTE_PATHS.onboardingRole);
      },
    });
  }
}
