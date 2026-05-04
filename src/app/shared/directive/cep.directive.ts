import { Directive, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URI_PATH } from '../constant/path.contant';
import { AddressData } from '../types/address-data';
import { RequestService } from '../../core/services/request.service';

@Directive({
  selector: '[appCepValidator]',
  standalone: true,
})
export class CepValidatorDirective {
  private requestService = inject(RequestService);

  @Output() addressDataFetched = new EventEmitter<AddressData>();
  @Output() cepInvalid = new EventEmitter<void>();


  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    const cep = value.replace(/\D+/g, '');
    if (this.isValidCep(cep)) {
      this.fetchCepData(cep).subscribe({
        next: (response) => {
          this.addressDataFetched.emit(response);
        },
        error: () => this.cepInvalid.emit(),
      });
    } else {
      this.cepInvalid.emit();
    }
  }

  isValidCep(cep: string): boolean {
    return /^[0-9]{8}$/.test(cep);
  }

  fetchCepData(cep: string): Observable<AddressData> {
    return this.requestService.get<AddressData>(`${URI_PATH.BRASIL_API.CEP}${cep}`, {
      api: 'BRASIL_API',
    });
  }
}
