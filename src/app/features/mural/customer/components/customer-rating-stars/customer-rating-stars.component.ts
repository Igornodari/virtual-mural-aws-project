import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { CUSTOMER_STARS } from '../../customer.constants';

export type CustomerRatingStarsSize = 'sm' | 'md';

@Component({
  selector: 'app-customer-rating-stars',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './customer-rating-stars.component.html',
  styleUrls: ['./customer-rating-stars.component.scss'],
})
export class CustomerRatingStarsComponent {
  @Input() rating = 0;
  @Input() size: CustomerRatingStarsSize = 'md';

  readonly stars = CUSTOMER_STARS;
}
