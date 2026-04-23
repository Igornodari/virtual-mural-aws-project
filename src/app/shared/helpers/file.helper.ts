import { inject } from '@angular/core';
import { SnackBarService } from 'src/app/services/snack-bar.service';

export const Validade = (file: any) => {
	const _snackBar = inject(SnackBarService);
	if (!file || file.length === 0) {
		_snackBar.error('Nenhum imagem selecionada!');
		return false;
	}
	const mimeType = file.type;
	if (mimeType.match(/image\/*/) == null) {
		_snackBar.error('imagem não suportada !');

		return false;
	}

	if (file.size > 2000000) {
		_snackBar.error('Não permitido arquivos com mais de 2mb !');

		return false;
	}
	return file;
};
