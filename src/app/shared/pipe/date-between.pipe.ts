import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from '../helpers';

@Pipe({
	standalone: true,
	name: 'dateBetween',
})
export class DateBetween implements PipeTransform {
	transform(startDate: string | Date,EndDate?: string | Date): string {
		return DateTime.calculateDateDifference(startDate,EndDate);
	}
}
