import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'nestedValue',
	standalone: true,
})
export class NestedValuePipe implements PipeTransform {
	transform(obj: any, path: string, defaultValue: any = ''): any {
		if (!obj || !path) return defaultValue;

		return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
	}
}
