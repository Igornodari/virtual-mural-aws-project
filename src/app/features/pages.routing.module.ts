import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { ROUTE_PATHS } from '../shared/constant/route-paths.constant';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';

export const PAGES_ROUTES: Routes = [
  {
    path: ROUTE_PATHS.dashboard.slice(1),
    canActivate: [authGuard],
    component: DashboardComponent,
    data: {
      title: 'Home',
    },
  },
  {
    path: ROUTE_PATHS.profile.slice(1),
    canActivate: [authGuard],
    component: ProfileComponent,
    data: {
      title: 'Perfil',
    },
  },
];
