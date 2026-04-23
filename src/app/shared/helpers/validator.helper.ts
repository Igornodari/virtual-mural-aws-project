import { AbstractControl, ValidationErrors } from '@angular/forms';
import { cnpj, cpf } from 'cpf-cnpj-validator';

export class ValidatorHelper {
	static doc(control: AbstractControl): ValidationErrors | null {
		if (control.value) {
			if (cpf.isValid(control.value) || cnpj.isValid(control.value)) return null;
			else return { invalid: true };
		}
		return null;
	}

	static fileMaxSize(control: AbstractControl): ValidationErrors | null {
		if (control.value) {
			if (control.value.size > 4000000) {
				return { invalid: true, msg: 'Não permitido arquivos com mais de 4mb !' };
			}
			return null;
		}
		return null;
	}
}
