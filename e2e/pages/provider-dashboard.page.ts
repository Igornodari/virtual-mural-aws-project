import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para o dashboard do prestador (provider).
 */
export class ProviderDashboardPage {
  readonly addServiceButton: Locator;
  readonly serviceTitleInput: Locator;
  readonly serviceDescInput: Locator;
  readonly servicePriceInput: Locator;
  readonly saveServiceButton: Locator;

  constructor(private readonly page: Page) {
    this.addServiceButton = page.locator('[data-testid="add-service-btn"]');
    this.serviceTitleInput = page.locator('[data-testid="service-title-input"]');
    this.serviceDescInput = page.locator('[data-testid="service-description-input"]');
    this.servicePriceInput = page.locator('[data-testid="service-price-input"]');
    this.saveServiceButton = page.locator('[data-testid="save-service-btn"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/mural/provider');
    await this.page.waitForLoadState('networkidle');
  }

  async createService(data: { title: string; description: string; price: string }): Promise<void> {
    await this.addServiceButton.click();
    await this.serviceTitleInput.fill(data.title);
    await this.serviceDescInput.fill(data.description);
    await this.servicePriceInput.fill(data.price);
    await this.saveServiceButton.click();
  }
}
