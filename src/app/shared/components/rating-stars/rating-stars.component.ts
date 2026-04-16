import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type RatingStarsSize = 'xs' | 'sm' | 'md' | 'lg';

const STARS = [1, 2, 3, 4, 5] as const;

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss'],
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() size: RatingStarsSize = 'md';

  readonly stars = STARS;
}
