import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="blank-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .blank-layout {
      height: 100%;
      width: 100%;
    }
  `]
})
export class BlankComponent {}
