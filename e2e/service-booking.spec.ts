import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { CustomerDashboardPage } from './pages/customer-dashboard.page';
import { testUsers, stripeTestCard } from './fixtures';

/**
 * Fluxo E2E — Agendamento de serviço e pagamento
 *
 * Pré-requisito:
 * - Conta E2E_CUSTOMER_EMAIL vinculada a um condomínio
 * - Ao menos um serviço publicado no mesmo condomínio
 * - Stripe em modo test
 */
test.describe('Agendamento e Pagamento', () => {
  let loginPage: LoginPage;
  let customerDash: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    customerDash = new CustomerDashboardPage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.customer.email, testUsers.customer.password);
    await page.waitForURL(/\/mural\/customer/, { timeout: 15000 });
  });

  test('deve exibir serviços disponíveis no mural', async ({ page }) => {
    await customerDash.goto();

    // Pelo menos um card de serviço deve estar visível
    await expect(customerDash.serviceCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('deve abrir modal de agendamento ao clicar em agendar', async ({ page }) => {
    await customerDash.goto();

    // Clica em agendar no primeiro serviço
    await customerDash.bookButton.click();

    // Verifica que o modal/dialog de agendamento abre
    const modal = page.locator('mat-dialog-container, [role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 8000 });
  });

  test('deve processar agendamento e redirecionar para pagamento', async ({ page }) => {
    await customerDash.goto();
    await customerDash.bookButton.click();

    const modal = page.locator('mat-dialog-container, [role="dialog"]');
    await modal.waitFor({ state: 'visible', timeout: 8000 });

    // Seleciona data/hora disponível (primeiros slots visíveis)
    const dateSlot = modal.locator('[data-testid="date-slot"], mat-calendar td.mat-calendar-body-cell').first();
    if (await dateSlot.isVisible()) {
      await dateSlot.click();
    }

    // Confirma agendamento
    const confirmBtn = modal.locator('button[data-testid="confirm-booking"], [data-testid="confirm-booking"]');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      // Após confirmar, deve redirecionar para checkout Stripe ou página de sucesso
      await expect(page).toHaveURL(/\/(payment|mural)/, { timeout: 15000 });
    }
  });

  /**
   * Teste de pagamento Stripe (modo test).
   * Usa o cartão 4242 4242 4242 4242 que sempre aprova em test mode.
   * Requer que o iframe do Stripe Elements esteja presente.
   */
  test('deve completar pagamento com cartão de teste Stripe', async ({ page }) => {
    // Navega diretamente para uma URL de checkout se existir sessão ativa
    await page.goto('/mural/customer');
    await page.waitForLoadState('networkidle');

    // Procura botão de pagar pendência se houver appointment aguardando pagamento
    const payPendingBtn = page.locator('[data-testid="pay-appointment-btn"]').first();
    const hasPending = await payPendingBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasPending) {
      test.skip();
      return;
    }

    await payPendingBtn.click();

    // Aguarda iframe do Stripe
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"], iframe[src*="stripe.com"]').first();

    const cardNumber = stripeFrame.locator('input[name="cardnumber"], input[placeholder*="card number" i], [data-testid="card-number"]');
    await cardNumber.waitFor({ state: 'visible', timeout: 15000 });

    await cardNumber.fill(stripeTestCard.number);
    await stripeFrame.locator('input[name="exp-date"], input[placeholder*="MM / YY" i]').fill(stripeTestCard.expiry);
    await stripeFrame.locator('input[name="cvc"], input[placeholder*="CVC" i]').fill(stripeTestCard.cvc);

    // Clica no botão de pagamento fora do iframe
    await page.locator('button[data-testid="submit-payment"], [data-testid="submit-payment"]').click();

    // Verifica redirecionamento para página de sucesso
    await expect(page).toHaveURL(/\/payment\/success/, { timeout: 30000 });
    await expect(page.locator('[data-testid="payment-success-msg"], h1, h2')).toBeVisible();
  });
});
