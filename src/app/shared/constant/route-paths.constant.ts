import { UserRole } from '../types';

export const ROUTE_PATHS = {
  login: '/authentication/login',
  register: '/register',
  authCallback: '/auth/callback',
  dashboard: '/dashboard',
  profile: '/profile',
  onboardingCondominium: '/onboarding/condominium',
  onboardingRole: '/onboarding/role',
  muralProvider: '/mural/provider',
  muralCustomer: '/mural/customer',
} as const;

export function getDashboardRouteByRole(role: UserRole | null | undefined): string {
  return role === 'provider' ? ROUTE_PATHS.muralProvider : ROUTE_PATHS.muralCustomer;
}
