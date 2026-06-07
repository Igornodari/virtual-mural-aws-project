import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

@Component({
  selector: 'app-terms-of-use',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class TermsOfUseComponent {
  readonly loginPath = ROUTE_PATHS.login;
  readonly privacidadePath = ROUTE_PATHS.privacidade;
  readonly lastUpdated = '19 de maio de 2026';
}
