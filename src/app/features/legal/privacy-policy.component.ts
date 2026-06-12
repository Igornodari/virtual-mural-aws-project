import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class PrivacyPolicyComponent {
  readonly loginPath = ROUTE_PATHS.login;
  readonly termosPath = ROUTE_PATHS.termos;
  readonly lastUpdated = '19 de maio de 2026';
}
