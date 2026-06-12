import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para a tela de cadastro.
 */
export class RegisterPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.locator('input[autocomplete="given-name"]');
    this.lastNameInput = page.locator('input[autocomplete="family-name"]');
    this.emailInput = page.locator('input[autocomplete="email"]');
    this.passwordInput = page.locator('input[autocomplete="new-password"]').first();
    this.confirmPasswordInput = page.locator('input[autocomplete="new-password"]').last();
    this.termsCheckbox = page.locator('mat-checkbox[formcontrolname="termsAccepted"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);
    await this.termsCheckbox.click();
    await this.submitButton.click();
  }
}
