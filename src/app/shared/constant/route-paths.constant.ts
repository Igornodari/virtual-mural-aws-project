export const ROUTE_PATHS = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  confirmEmail: '/confirm-email',
  authCallback: '/auth/callback',
  dashboard: '/dashboard',
  profile: '/profile',
  muralAppointments: '/mural/appointments',
  onboardingCondominium: '/onboarding/condominium',
  /**
   * Dashboard padrão de morador (qualquer usuário autenticado e vinculado
   * a um condomínio acessa aqui após o login).
   */
  muralCustomer: '/mural/customer',
  /**
   * Dashboard de prestador. Acesso protegido pelo `providerGuard`: só
   * usuários com `isProvider === true` conseguem entrar.
   */
  muralProvider: '/mural/provider',
  paymentSuccess: '/payment-success',
  paymentCancel: '/payment-cancel',
  /** Documentos legais — rotas públicas, sem auth guard. */
  termos: '/termos',
  privacidade: '/privacidade',
} as const;

/**
 * Rota padrão pós-onboarding. Todo usuário começa como morador e cai no
 * dashboard de cliente; se for prestador, ele pode alternar via toggle
 * no topbar ou pelo item extra do bottom nav.
 */
export function getDefaultMuralRoute(): string {
  return ROUTE_PATHS.muralCustomer;
}
