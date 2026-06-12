import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { testUsers } from './fixtures';

/**
 * Fluxo E2E — Autenticação
 *
 * Pré-requisito: conta E2E_CUSTOMER_EMAIL deve existir no Cognito User Pool.
 * Crie-a manualmente no painel Cognito ou via AWS CLI antes de rodar.
 */
test.describe('Autenticação', () => {
  test('deve exibir formulário de login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('deve exibir erro para credenciais inválidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('invalid@example.com', 'wrong-password');

    // O GlobalErrorHandler exibe snackbar com mensagem de erro
    await expect(page.locator('mat-snack-bar-container')).toBeVisible({ timeout: 8000 });
  });

  test('deve fazer login com credenciais válidas e redirecionar', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(testUsers.customer.email, testUsers.customer.password);

    // Após login bem-sucedido, redireciona para dashboard ou onboarding
    await expect(page).toHaveURL(/\/(mural|onboarding|dashboard)/, { timeout: 15000 });
  });

  test('deve fazer logout e retornar ao login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.customer.email, testUsers.customer.password);
    await page.waitForURL(/\/(mural|onboarding|dashboard)/, { timeout: 15000 });

    // Abre menu lateral ou header e clica em sair
    const logoutButton = page.locator('[data-testid="logout-btn"]');
    await logoutButton.click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
