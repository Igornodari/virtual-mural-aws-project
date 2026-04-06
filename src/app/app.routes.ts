import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { ROUTE_PATHS } from './shared/constant/route-paths.constant';
import { FullComponent } from './layout/full.component';
import { BlankComponent } from './layout/blank.component';

export const routes: Routes = [
  // Layout para páginas públicas (Login, Register, etc.)
  {
    path: '',
    component: BlankComponent,
    children: [
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
    ]
  },

  // Layout para páginas autenticadas (Dashboards, Perfil, etc.)
  {
    path: '',
    component: FullComponent,
    canActivate: [authGuard],
    children: [
      {
        path: ROUTE_PATHS.muralProvider.slice(1),
        canActivate: [onboardingGuard],
        loadComponent: () =>
          import('./features/mural/provider/provider-dashboard.component').then(
            (m) => m.ProviderDashboardComponent,
          ),
      },
      {
        path: ROUTE_PATHS.muralCustomer.slice(1),
        canActivate: [onboardingGuard],
        loadComponent: () =>
          import('./features/mural/customer/customer-dashboard.component').then(
            (m) => m.CustomerDashboardComponent,
          ),
      },
      {
        path: ROUTE_PATHS.profile.slice(1),
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: ROUTE_PATHS.dashboard.slice(1),
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ]
  },

  // Layout para Onboarding (sem Sidebar, apenas Blank)
  {
    path: '',
    component: BlankComponent,
    canActivate: [authGuard],
    children: [
      {
        path: ROUTE_PATHS.onboardingCondominium.slice(1),
        loadComponent: () =>
          import('./features/onboarding/condominium/condominium-onboarding.component').then(
            (m) => m.CondominiumOnboardingComponent,
          ),
      },
      {
        path: ROUTE_PATHS.onboardingRole.slice(1),
        loadComponent: () =>
          import('./features/onboarding/role/role-onboarding.component').then(
            (m) => m.RoleOnboardingComponent,
          ),
      },
    ]
  },

  {
    path: '**',
    redirectTo: ROUTE_PATHS.login.slice(1),
  },
];
