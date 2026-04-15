import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import BaseComponent from '../../../components/base.component';
import { CondominiumApiService, ViaCepResponse } from '../../../core/services/condominium-api.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { ROUTE_PATHS } from '../../../shared/constant/route-paths.constant';
import { CondominiumAddress } from '../../../shared/types';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { finalize } from 'rxjs';

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
  templateUrl: './condominium-onboarding.component.html',
  styleUrls: ['./condominium-onboarding.component.scss'],
})
export class CondominiumOnboardingComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
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

    this.condominiumApi.lookupCep(raw).pipe(
      finalize(() => (this.loadingCep = false)),
    ).subscribe({
      next: (data: ViaCepResponse) => {
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

    this.onboardingService.ensureCondominiumRegistration(address).pipe(
      finalize(() => this.setLoadingState(false)),
    ).subscribe({
      next: () => {
        this.navigateTo(ROUTE_PATHS.onboardingRole);
      },
      error: () => {
        this.navigateTo(ROUTE_PATHS.onboardingRole);
      },
    });
  }
}
