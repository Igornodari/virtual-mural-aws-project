import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../../components/base.component';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { UserRole } from '../../../shared/types';

interface RoleOption {
  value: UserRole;
  icon: string;
  title: string;
  subtitle: string;
  features: string[];
  color: string;
}

@Component({
  selector: 'app-role-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <div class="app-auth-page">
      <div class="role-shell">
        <div class="role-header">
          <span class="app-badge">Mural do Condomínio</span>
          <h1 class="m-t-3 m-b-1">Como você quer usar o mural?</h1>
          <p class="text-muted m-0">
            Escolha o seu perfil. Você poderá alterar isso depois nas configurações.
          </p>
        </div>

        <div class="role-grid">
          @for (option of roleOptions; track option.value) {
            <button
              class="role-card"
              [class.role-card--selected]="selected() === option.value"
              [style.--role-color]="option.color"
              (click)="select(option.value)"
              type="button"
            >
              <div class="role-card__icon-wrap">
                <mat-icon class="role-card__icon">{{ option.icon }}</mat-icon>
              </div>
              <div class="role-card__body">
                <strong class="role-card__title">{{ option.title }}</strong>
                <p class="role-card__subtitle text-muted">{{ option.subtitle }}</p>
                <ul class="role-card__features">
                  @for (feat of option.features; track feat) {
                    <li>
                      <mat-icon class="feat-icon">check_circle</mat-icon>
                      <span>{{ feat }}</span>
                    </li>
                  }
                </ul>
              </div>
              @if (selected() === option.value) {
                <mat-icon class="role-card__check">check_circle</mat-icon>
              }
            </button>
          }
        </div>

        <button
          mat-raised-button
          color="primary"
          class="confirm-btn"
          [disabled]="!selected() || loading"
          (click)="onConfirm()"
        >
          @if (loading) {
            <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
          } @else {
            Confirmar e entrar no mural
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .role-shell {
      width: min(760px, 100%);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .role-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .role-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 28px 24px;
      border-radius: 16px;
      border: 2px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
      cursor: pointer;
      text-align: left;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    }
    .role-card:hover {
      border-color: var(--role-color, var(--mat-sys-primary));
      box-shadow: 0 8px 28px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }
    .role-card--selected {
      border-color: var(--role-color, var(--mat-sys-primary));
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--role-color, var(--mat-sys-primary)) 25%, transparent);
      background: color-mix(in oklab, var(--role-color, var(--mat-sys-primary)) 6%, var(--mat-sys-surface));
    }
    .role-card__icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: color-mix(in oklab, var(--role-color, var(--mat-sys-primary)) 15%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .role-card__icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--role-color, var(--mat-sys-primary));
    }
    .role-card__body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .role-card__title {
      font-size: 18px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }
    .role-card__subtitle {
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }
    .role-card__features {
      list-style: none;
      padding: 0;
      margin: 8px 0 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .role-card__features li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
    }
    .feat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--role-color, var(--mat-sys-primary));
    }
    .role-card__check {
      position: absolute;
      top: 16px;
      right: 16px;
      color: var(--role-color, var(--mat-sys-primary));
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .confirm-btn {
      width: 100%;
      height: 52px;
      font-size: 16px;
    }
    .btn-spinner {
      display: inline-block;
    }
    @media (max-width: 600px) {
      .role-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class RoleOnboardingComponent extends BaseComponent {
  private readonly onboardingService = inject(OnboardingService);

  selected = signal<UserRole | null>(null);

  readonly roleOptions: RoleOption[] = [
    {
      value: 'provider',
      icon: 'handyman',
      title: 'Prestador de Serviço',
      subtitle: 'Quero anunciar meus serviços para os moradores do condomínio.',
      color: '#7c3aed',
      features: [
        'Crie cards de serviços no mural',
        'Defina preços e disponibilidade',
        'Receba avaliações dos clientes',
        'Gerencie seus agendamentos',
      ],
    },
    {
      value: 'customer',
      icon: 'search',
      title: 'Morador',
      subtitle: 'Quero encontrar serviços oferecidos por moradores do meu condomínio.',
      color: '#0284c7',
      features: [
        'Veja todos os serviços disponíveis',
        'Entre em contato diretamente',
        'Marque horários com prestadores',
        'Avalie os serviços contratados',
      ],
    },
  ];

  constructor() {
    super({ loadUnit: false });
  }

  select(role: UserRole): void {
    this.selected.set(role);
  }

  async onConfirm(): Promise<void> {
    const role = this.selected();
    if (!role) return;

    this.setLoadingState(true);
    const destination = role === 'provider' ? '/mural/provider' : '/mural/customer';

    this.onboardingService.saveRole(role).subscribe({
      next: () => {
        this.setLoadingState(false);
        this.navigateTo(destination);
      },
      error: () => {
        // Em caso de falha de rede, o estado local já foi salvo pelo serviço
        this.setLoadingState(false);
        this.navigateTo(destination);
      },
    });
  }
}
