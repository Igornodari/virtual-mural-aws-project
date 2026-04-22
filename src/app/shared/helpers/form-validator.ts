import { AbstractControl, ValidationErrors } from '@angular/forms';

export class FormValidators {
    // Validação de CPF
    static cpf(control: AbstractControl): ValidationErrors | null {
        const cpf = control.value?.replace(/\D/g, '');
        if (!cpf || cpf.length !== 11 || /(\d)\1{10}/.test(cpf)) {
            return { invalidCPF: true };
        }
        let sum = 0;
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.charAt(i - 1), 10) * (11 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9), 10)) return { invalidCPF: true };

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.charAt(i - 1), 10) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(10), 10)) return { invalidCPF: true };

        return null;
    }

    // Validação de Data de Nascimento
    static birthDate(control: AbstractControl): ValidationErrors | null {
        const today = new Date();
        const birthDate = new Date(control.value);
        return birthDate >= today ? { invalidBirthDate: true } : null;
    }
}
