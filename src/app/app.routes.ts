import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('../app/features/auth-callback.components').then(
        (m) => m.AuthCallbackComponent,
      ),
  },
  // Rota legada de dashboard — redireciona para o fluxo de onboarding
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  // Onboarding: cadastro de condomínio
  {
    path: 'onboarding/condominium',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/condominium/condominium-onboarding.component').then(
        (m) => m.CondominiumOnboardingComponent,
      ),
  },
  // Onboarding: escolha de perfil (prestador ou morador)
  {
    path: 'onboarding/role',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/role/role-onboarding.component').then(
        (m) => m.RoleOnboardingComponent,
      ),
  },
  // Mural do prestador de serviço
  {
    path: 'mural/provider',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/mural/provider/provider-dashboard.component').then(
        (m) => m.ProviderDashboardComponent,
      ),
  },
  // Mural do morador consumidor
  {
    path: 'mural/customer',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/mural/customer/customer-dashboard.component').then(
        (m) => m.CustomerDashboardComponent,
      ),
  },
  // Fallback
  {
    path: '**',
    redirectTo: 'login',
  },
];
