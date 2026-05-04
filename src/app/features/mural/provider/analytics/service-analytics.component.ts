import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import {
  ServiceApiService,
  ServiceDto,
  ServiceAnalyticsDto,
} from '../../../../core/services/service-api.service';
import { ReviewApiService, AnonymousReviewDto } from '../../../../core/services/review-api.service';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from 'src/app/shared/components/loading-state/loading-state.component';
import { RatingStarsComponent } from 'src/app/shared/components/rating-stars/rating-stars.component';

@Component({
  selector: 'app-service-analytics',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    TranslateModule,
    EmptyStateComponent,
    LoadingStateComponent,
    RatingStarsComponent,
  ],
  templateUrl: './service-analytics.component.html',
  styleUrls: ['./service-analytics.component.scss'],
})
export class ServiceAnalyticsComponent implements OnChanges {
  @Input() service: ServiceDto | null = null;

  private readonly serviceApi = inject(ServiceApiService);
  private readonly reviewApi = inject(ReviewApiService);
  private readonly platformId = inject(PLATFORM_ID);

  analytics = signal<ServiceAnalyticsDto | null>(null);
  reviews = signal<AnonymousReviewDto[]>([]);
  isLoading = signal(false);
  isLoadingReviews = signal(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chart: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['service'] && this.service) {
      this.loadData();
    }
  }

  private loadData(): void {
    if (!this.service) return;
    this.isLoading.set(true);
    this.analytics.set(null);
    this.reviews.set([]);

    this.serviceApi.getAnalytics(this.service.id).pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: (data) => {
        this.analytics.set(data);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.renderFunnelChart(data), 100);
        }
      },
    });

    this.isLoadingReviews.set(true);
    this.reviewApi.findByService(this.service.id).pipe(
      finalize(() => this.isLoadingReviews.set(false)),
    ).subscribe({
      next: (list) => {
        this.reviews.set(list);
      },
    });
  }

  private async renderFunnelChart(data: ServiceAnalyticsDto): Promise<void> {
    if (!this.service) return;
    const echarts = await import('echarts');
    const canvasId = `funnel-chart-${this.service.id}`;
    const el = document.getElementById(canvasId);
    if (!el) return;

    if (this.chart) {
      this.chart.dispose();
    }
    this.chart = echarts.init(el, undefined, { renderer: 'canvas', height: 260 });

    const isDark = document.documentElement.classList.contains('dark-theme');
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const bgColor = 'transparent';

    this.chart.setOption({
      backgroundColor: bgColor,
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [
        {
          type: 'funnel',
          left: '10%',
          width: '80%',
          min: 0,
          max: Math.max(data.clicks, 1),
          minSize: '20%',
          maxSize: '100%',
          sort: 'descending',
          gap: 6,
          label: {
            show: true,
            position: 'inside',
            color: '#fff',
            fontSize: 13,
            fontWeight: 'bold',
          },
          labelLine: { show: false },
          itemStyle: { borderWidth: 0, borderRadius: 4 },
          emphasis: { label: { fontSize: 14 } },
          data: [
            { value: data.clicks, name: 'Visualizações', itemStyle: { color: '#3b82f6' } },
            { value: data.interests, name: 'Interessados', itemStyle: { color: '#22c55e' } },
            { value: data.completions, name: 'Concluídos', itemStyle: { color: '#a855f7' } },
            { value: data.abandonments, name: 'Abandonados', itemStyle: { color: '#ef4444' } },
          ],
        },
      ],
      legend: {
        bottom: 0,
        textStyle: { color: textColor, fontSize: 12 },
        data: ['Visualizações', 'Interessados', 'Concluídos', 'Abandonados'],
      },
    });

    window.addEventListener('resize', () => this.chart?.resize());
  }

  getStarCount(star: number): number {
    return this.reviews().filter((r) => Math.round(r.rating) === star).length;
  }

  getStarPercent(star: number): number {
    const total = this.reviews().length;
    if (total === 0) return 0;
    return (this.getStarCount(star) / total) * 100;
  }
}
