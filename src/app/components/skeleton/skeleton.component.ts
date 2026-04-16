import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de skeleton loading reutilizável.
 * Exibe blocos animados no lugar do conteúdo enquanto os dados são carregados.
 *
 * @example
 * <!-- Skeleton de card de serviço -->
 * <app-skeleton variant="service-card" [count]="3" />
 *
 * <!-- Skeleton de linha de texto -->
 * <app-skeleton variant="text" [count]="4" />
 *
 * <!-- Skeleton de stat card -->
 * <app-skeleton variant="stat" [count]="4" />
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent {
  /** Variante visual do skeleton */
  @Input() variant: 'service-card' | 'stat' | 'text' | 'profile-header' | 'default' = 'default';

  /** Número de skeletons a renderizar */
  @Input() count = 1;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
