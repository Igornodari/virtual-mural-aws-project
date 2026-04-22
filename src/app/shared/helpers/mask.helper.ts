export const maskCpfCnpj = (value: string): null | string => {
	if (!value) {
		return null;
	}
	const valueclean = value.replace(/\D/g, '');
	if (valueclean === '00000000000' || valueclean === '') {
		return null;
	}
	if (valueclean.length === 14) {
		return valueclean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5');
	} else if (valueclean.length === 11) {
		return valueclean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
	} else {
		return null;
	}
};
