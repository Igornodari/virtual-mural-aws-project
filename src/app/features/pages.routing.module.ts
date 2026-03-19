import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';

export const PAGES_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent,
    data: {
      title: 'Home',
    },
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    component: ProfileComponent,
    data: {
      title: 'Perfil',
    },
  },
];
