import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageLoadingComponent } from './components/page-loading/page-loading.component';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PageLoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly loadingService = inject(LoadingService);
}
