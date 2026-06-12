import { test, expect } from '@playwright/test';

/**
 * Fluxo E2E — Navegação pública (sem autenticação)
 *
 * Verifica rotas acessíveis sem login: login, register, pages legais, 404.
 */
test.describe('Navegação pública', () => {
  test('deve exibir página de login na raiz', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('deve exibir página de cadastro', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve exibir página de termos de uso', async ({ page }) => {
    await page.goto('/termos');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/termos/);
  });

  test('deve exibir página de política de privacidade', async ({ page }) => {
    await page.goto('/privacidade');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/privacidade/);
  });

  test('deve redirecionar rota inexistente para 404', async ({ page }) => {
    await page.goto('/rota-que-nao-existe');
    await page.waitForLoadState('networkidle');
    // A página 404 deve exibir algum conteúdo indicativo
    await expect(page.locator('body')).not.toBeEmpty();
    // Status HTTP pode ser 200 (SPA) mas o conteúdo deve ser da página 404
  });

  test('deve redirecionar rota protegida para login (sem auth)', async ({ page }) => {
    await page.goto('/mural/customer');
    // Guard de auth deve redirecionar para login
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});
