import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-state.component.html',
  styleUrls: ['./loading-state.component.scss'],
})
export class LoadingStateComponent {
  @Input() diameter = 40;
  @Input() padded = true;
}
