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
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import BaseComponent from '../../../components/base.component';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { CondominiumAddress } from '../../../shared/types';

const BRAZIL_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
];

function cepValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString().replace(/\D/g, '');
  return raw.length === 8 ? null : { invalidCep: true };
}

@Component({
  selector: 'app-condominium-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatStepperModule,
    TranslateModule,
  ],
  template: `
    <div class="app-auth-page">
      <div class="onboarding-shell">
        <div class="onboarding-header">
          <span class="app-badge">Mural do Condomínio</span>
          <h1 class="m-t-3 m-b-1">Onde você mora?</h1>
          <p class="text-muted m-0">
            Precisamos do endereço do seu condomínio para exibir os serviços disponíveis perto de você.
            Essa informação é salva apenas uma vez.
          </p>
        </div>

        <mat-card class="surface-card--elevated onboarding-card">
          <mat-card-content class="p-0">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="d-flex flex-col gap-4">

              <!-- CEP com busca automática -->
              <div class="cep-row">
                <mat-form-field appearance="outline" class="cep-field">
                  <mat-label>CEP</mat-label>
                  <input
                    matInput
                    formControlName="zipCode"
                    placeholder="00000-000"
                    maxlength="9"
                    (input)="onCepInput($event)"
                  />
                  @if (loadingCep) {
                    <mat-spinner matSuffix diameter="20"></mat-spinner>
                  }
                  @if (form.controls.zipCode.touched && form.controls.zipCode.invalid) {
                    <mat-error>Informe um CEP válido com 8 dígitos.</mat-error>
                  }
                </mat-form-field>
                <button
                  mat-stroked-button
                  type="button"
                  class="cep-btn"
                  [disabled]="form.controls.zipCode.invalid || loadingCep"
                  (click)="fetchAddress()"
                >
                  Buscar
                </button>
              </div>

              @if (cepError) {
                <div class="app-error-box">{{ cepError }}</div>
              }

              <!-- Logradouro -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Rua / Logradouro</mat-label>
                <input matInput formControlName="street" placeholder="Ex: Rua das Flores" />
                @if (form.controls.street.touched && form.controls.street.invalid) {
                  <mat-error>Informe o logradouro.</mat-error>
                }
              </mat-form-field>

              <div class="two-col">
                <!-- Número -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Número</mat-label>
                  <input matInput formControlName="number" placeholder="Ex: 123" />
                  @if (form.controls.number.touched && form.controls.number.invalid) {
                    <mat-error>Informe o número.</mat-error>
                  }
                </mat-form-field>

                <!-- Complemento -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Complemento (opcional)</mat-label>
                  <input matInput formControlName="complement" placeholder="Apto, Bloco..." />
                </mat-form-field>
              </div>

              <!-- Bairro -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Bairro</mat-label>
                <input matInput formControlName="neighborhood" placeholder="Ex: Centro" />
                @if (form.controls.neighborhood.touched && form.controls.neighborhood.invalid) {
                  <mat-error>Informe o bairro.</mat-error>
                }
              </mat-form-field>

              <div class="two-col">
                <!-- Cidade -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Cidade</mat-label>
                  <input matInput formControlName="city" placeholder="Ex: São Paulo" />
                  @if (form.controls.city.touched && form.controls.city.invalid) {
                    <mat-error>Informe a cidade.</mat-error>
                  }
                </mat-form-field>

                <!-- Estado -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Estado</mat-label>
                  <mat-select formControlName="state">
                    @for (uf of states; track uf) {
                      <mat-option [value]="uf">{{ uf }}</mat-option>
                    }
                  </mat-select>
                  @if (form.controls.state.touched && form.controls.state.invalid) {
                    <mat-error>Selecione o estado.</mat-error>
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
                  Continuar
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
    }
    .cep-field {
      flex: 1;
    }
    .cep-btn {
      margin-top: 4px;
      height: 56px;
      white-space: nowrap;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .btn-spinner {
      display: inline-block;
    }
    @media (max-width: 480px) {
      .two-col {
        grid-template-columns: 1fr;
      }
      .onboarding-card {
        padding: 20px;
      }
    }
  `],
})
export class CondominiumOnboardingComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
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
    super({ loadUnit: false });
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
    if (raw.length !== 8) return;

    this.loadingCep = true;
    this.cepError = '';

    this.http
      .get<any>(`https://viacep.com.br/ws/${raw}/json/`)
      .pipe(catchError(() => of(null)))
      .subscribe((data) => {
        this.loadingCep = false;
        if (!data || data.erro) {
          this.cepError = 'CEP não encontrado. Preencha o endereço manualmente.';
          return;
        }
        this.form.patchValue({
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        });
      });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

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

    // Tenta vincular a um condomínio existente pelo CEP;
    // se não encontrar, cria um novo no backend.
    this.onboardingService.saveCondominiumAddress(address).subscribe({
      next: (existing: any) => {
        const found = Array.isArray(existing) && existing.length > 0;
        if (!found) {
          this.onboardingService.createCondominium(address).subscribe({
            next: () => {
              this.setLoadingState(false);
              this.navigateTo('/onboarding/role');
            },
            error: () => {
              this.setLoadingState(false);
              this.navigateTo('/onboarding/role');
            },
          });
        } else {
          this.setLoadingState(false);
          this.navigateTo('/onboarding/role');
        }
      },
      error: () => {
        this.setLoadingState(false);
        this.navigateTo('/onboarding/role');
      },
    });
  }
}
