import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { testUsers, testCondominium } from './fixtures';

/**
 * Fluxo E2E — Onboarding (vinculação ao condomínio)
 *
 * Pré-requisito: conta E2E_CUSTOMER_EMAIL deve existir sem vínculo com condomínio,
 * e o código E2E_CONDO_CODE deve ser um condomínio válido no banco de dados.
 */
test.describe('Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste deste grupo
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.customer.email, testUsers.customer.password);
    await page.waitForURL(/\/(mural|onboarding|dashboard)/, { timeout: 15000 });
  });

  test('deve exibir tela de onboarding para usuário sem condomínio', async ({ page }) => {
    await page.goto('/onboarding/condominium');
    await page.waitForLoadState('networkidle');

    // Verifica campos de vinculação
    await expect(page.locator('input[formcontrolname="condominiumCode"], [data-testid="condo-code-input"]'))
      .toBeVisible({ timeout: 8000 });
  });

  test('deve exibir erro para código de condomínio inválido', async ({ page }) => {
    await page.goto('/onboarding/condominium');
    await page.waitForLoadState('networkidle');

    const codeInput = page.locator(
      'input[formcontrolname="condominiumCode"], [data-testid="condo-code-input"]',
    );
    await codeInput.fill('CODIGO-INVALIDO-9999');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await expect(page.locator('mat-snack-bar-container, mat-error')).toBeVisible({ timeout: 8000 });
  });
});
