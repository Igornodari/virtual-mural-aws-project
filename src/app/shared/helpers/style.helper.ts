import { Status } from '../types';
import { TranslateService } from '@ngx-translate/core';

// Mantemos a assinatura original para compatibilidade
export const styleFromData = (
	styleData: Status[],
	status: string,
	translate?: TranslateService
): Status => {
	let found = styleData.find(data => data.name === status);
	if (!found && translate) {
		found = styleData.find(data => {
			try {
				return translate.instant(data.label) === status;
			} catch (_e) {
				return false;
			}
		});
	}
	return found ?? {
		label: status,
		style: 'default',
		name: status
	};
};
