import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { ROUTE_PATHS } from './shared/constant/route-paths.constant';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ROUTE_PATHS.login.slice(1),
  },
  {
    path: ROUTE_PATHS.login.slice(1),
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: ROUTE_PATHS.register.slice(1),
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: ROUTE_PATHS.authCallback.slice(1),
    loadComponent: () =>
      import('../app/features/auth-callback.components').then(
        (m) => m.AuthCallbackComponent,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/pages.routing.module').then((m) => m.PAGES_ROUTES),
  },
  {
    path: ROUTE_PATHS.onboardingCondominium.slice(1),
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/condominium/condominium-onboarding.component').then(
        (m) => m.CondominiumOnboardingComponent,
      ),
  },
  {
    path: ROUTE_PATHS.onboardingRole.slice(1),
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/role/role-onboarding.component').then(
        (m) => m.RoleOnboardingComponent,
      ),
  },
  {
    path: ROUTE_PATHS.muralProvider.slice(1),
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/mural/provider/provider-dashboard.component').then(
        (m) => m.ProviderDashboardComponent,
      ),
  },
  {
    path: ROUTE_PATHS.muralCustomer.slice(1),
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/mural/customer/customer-dashboard.component').then(
        (m) => m.CustomerDashboardComponent,
      ),
  },
  {
    path: '**',
    redirectTo: ROUTE_PATHS.login.slice(1),
  },
];
