import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para a tela de login.
 * Usa seletores semânticos (autocomplete, type) para ser resistente
 * a mudanças de texto/tradução.
 */
export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.locator('input[autocomplete="email"]');
    this.passwordInput = page.locator('input[autocomplete="current-password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
