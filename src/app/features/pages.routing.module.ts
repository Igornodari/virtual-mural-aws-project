import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { onboardingGuard } from '../core/guards/onboarding.guard';
import { ROUTE_PATHS } from '../shared/constant/route-paths.constant';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';

export const PAGES_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ROUTE_PATHS.dashboard.slice(1),
  },
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
  {
    path: ROUTE_PATHS.onboardingCondominium.slice(1),
    canActivate: [authGuard],
    loadComponent: () =>
      import('./onboarding/condominium/condominium-onboarding.component').then(
        (m) => m.CondominiumOnboardingComponent
      ),
  },
  {
    path: ROUTE_PATHS.onboardingRole.slice(1),
    canActivate: [authGuard],
    loadComponent: () =>
      import('./onboarding/role/role-onboarding.component').then(
        (m) => m.RoleOnboardingComponent
      ),
  },
  {
    path: ROUTE_PATHS.muralProvider.slice(1),
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./mural/provider/provider-dashboard.component').then(
        (m) => m.ProviderDashboardComponent
      ),
  },
  {
    path: ROUTE_PATHS.muralCustomer.slice(1),
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./mural/customer/customer-dashboard.component').then(
        (m) => m.CustomerDashboardComponent
      ),
  },
];
