/**
 * Dados de teste para os fluxos E2E.
 *
 * Credenciais reais lidas de variáveis de ambiente para não expor secrets.
 * Em dev, use .env.e2e (não comitar). Em CI, use GitHub Secrets.
 */

export const testUsers = {
  customer: {
    email: process.env.E2E_CUSTOMER_EMAIL ?? 'e2e-morador@example.com',
    password: process.env.E2E_CUSTOMER_PASSWORD ?? 'Test@1234',
    firstName: 'E2E',
    lastName: 'Morador',
  },
  provider: {
    email: process.env.E2E_PROVIDER_EMAIL ?? 'e2e-prestador@example.com',
    password: process.env.E2E_PROVIDER_PASSWORD ?? 'Test@1234',
    firstName: 'E2E',
    lastName: 'Prestador',
  },
} as const;

export const testCondominium = {
  code: process.env.E2E_CONDO_CODE ?? 'CONDO-TEST-001',
};

/** Cartão de crédito Stripe para modo teste */
export const stripeTestCard = {
  number: '4242 4242 4242 4242',
  expiry: '12/34',
  cvc: '123',
};
