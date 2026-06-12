import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para o dashboard do morador (customer).
 */
export class CustomerDashboardPage {
  readonly serviceCards: Locator;
  readonly bookButton: Locator;

  constructor(private readonly page: Page) {
    this.serviceCards = page.locator('[data-testid="service-card"]');
    this.bookButton = page.locator('[data-testid="book-service-btn"]').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/mural/customer');
    await this.page.waitForLoadState('networkidle');
  }

  /** Clica em "Agendar" no primeiro serviço disponível */
  async bookFirstService(): Promise<void> {
    await this.bookButton.click();
  }
}
