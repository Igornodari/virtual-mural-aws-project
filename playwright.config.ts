import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração Playwright para testes E2E do Mural Virtual.
 *
 * Variáveis de ambiente:
 *   E2E_BASE_URL          — URL base do app (padrão: http://localhost:4200)
 *   E2E_CUSTOMER_EMAIL    — E-mail da conta de teste (morador)
 *   E2E_CUSTOMER_PASSWORD — Senha da conta de teste (morador)
 *   E2E_PROVIDER_EMAIL    — E-mail da conta de teste (prestador)
 *   E2E_PROVIDER_PASSWORD — Senha da conta de teste (prestador)
 *
 * Em CI, defina via GitHub Actions secrets.
 * Em dev, crie .env.e2e (não comitar) e use:
 *   npx dotenv -e .env.e2e -- npx playwright test
 */

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Testes sequenciais para evitar conflito de dados de teste
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pt-BR',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Inicia ng serve automaticamente se não for apontado para servidor externo
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm start',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
