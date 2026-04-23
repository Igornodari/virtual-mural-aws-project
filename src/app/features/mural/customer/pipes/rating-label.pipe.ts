import { Pipe, PipeTransform } from '@angular/core';

import { RATING_LABELS } from '../customer.constants';

@Pipe({
  name: 'ratingLabel',
  standalone: true,
})
export class RatingLabelPipe implements PipeTransform {
  transform(rating: number | null | undefined): string {
    return rating ? RATING_LABELS[rating] || '' : '';
  }
}
