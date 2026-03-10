import { inject } from '@angular/core';
import { RequestService } from 'src/app/services/request.service';
import { URI_PATH } from '../constant/path.contant';
import { FormControl, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';

type Address = {
  addressNeighborhood: FormControl<string>;
  addressComplement: FormControl<string>;
  addressStreet: FormControl<string>;
  addressZipCode: FormControl<string>;
  addressCity: FormControl<string>;
  addressState: FormControl<string>;
}

type Coordinates = {
  longitude: string;
  latitude: string;
}

type Location = {
  type: string;
  coordinates: Coordinates;
}

type CepResponse = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location: Location;
}

export const fillFormWithCep = () => {
  const _requestService = inject(RequestService);
  return (cep: string, formGroup: FormGroup<Partial<Address>>) => {
    _requestService
      .get(`${URI_PATH.BRASIL_API.CEP}${cep}`, { api: 'BRASIL_API' })
      .pipe(
        map(response => response as CepResponse),
      )
      .subscribe({
        next: (response: CepResponse) => {
          if (response.neighborhood) {
            if (response.state.length > 2) {
              response.state = response.state.slice(0, 2);
            }
            formGroup.patchValue({
              addressNeighborhood: response.neighborhood,
              addressStreet: response.street,
              addressCity: response.city,
              addressState: response.state,
            });
          }
        },
      });
  };
};
