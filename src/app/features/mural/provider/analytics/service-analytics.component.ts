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
import { ServiceApiService, ServiceDto, ServiceAnalyticsDto } from '../../../../core/services/service-api.service';
import { ReviewApiService, AnonymousReviewDto } from '../../../../core/services/review-api.service';

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
  ],
  template: `
    <div class="analytics-wrapper">
      @if (!service) {
        <div class="empty-analytics">
          <mat-icon class="empty-icon">bar_chart</mat-icon>
          <p>{{ 'APP.ANALYTICS.SELECT_SERVICE' | translate }}</p>
        </div>
      } @else if (isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40" /></div>
      } @else if (analytics()) {
        <!-- KPIs -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <mat-icon class="kpi-icon kpi-icon--blue">visibility</mat-icon>
            <span class="kpi-value">{{ analytics()!.clicks }}</span>
            <span class="kpi-label">{{ 'APP.ANALYTICS.CLICKS' | translate }}</span>
          </div>
          <div class="kpi-card">
            <mat-icon class="kpi-icon kpi-icon--green">chat</mat-icon>
            <span class="kpi-value">{{ analytics()!.interests }}</span>
            <span class="kpi-label">{{ 'APP.ANALYTICS.INTERESTS' | translate }}</span>
          </div>
          <div class="kpi-card">
            <mat-icon class="kpi-icon kpi-icon--purple">check_circle</mat-icon>
            <span class="kpi-value">{{ analytics()!.completions }}</span>
            <span class="kpi-label">{{ 'APP.ANALYTICS.COMPLETIONS' | translate }}</span>
          </div>
          <div class="kpi-card">
            <mat-icon class="kpi-icon kpi-icon--red">cancel</mat-icon>
            <span class="kpi-value">{{ analytics()!.abandonments }}</span>
            <span class="kpi-label">{{ 'APP.ANALYTICS.ABANDONMENTS' | translate }}</span>
          </div>
        </div>

        <!-- Gráficos -->
        <mat-tab-group animationDuration="200ms">
          <!-- Aba 1: Funil de engajamento -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>funnel</mat-icon>
              &nbsp;{{ 'APP.ANALYTICS.TAB_FUNNEL' | translate }}
            </ng-template>
            <div class="chart-container">
              <canvas #funnelCanvas id="funnel-chart-{{ service.id }}"></canvas>
            </div>
          </mat-tab>

          <!-- Aba 2: Avaliações -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>star_rate</mat-icon>
              &nbsp;{{ 'APP.ANALYTICS.TAB_REVIEWS' | translate }}
            </ng-template>
            <div class="reviews-analytics">
              <!-- Resumo de rating -->
              <div class="rating-summary">
                <div class="rating-big">
                  <span class="rating-number">{{ service.rating | number:'1.1-1' }}</span>
                  <div class="rating-stars">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon class="star-sm" [class.star--filled]="star <= service.rating">star</mat-icon>
                    }
                  </div>
                  <span class="rating-total">{{ service.totalReviews }} {{ 'APP.ANALYTICS.REVIEWS_COUNT' | translate }}</span>
                </div>
                <!-- Barras de distribuição por estrela -->
                <div class="rating-bars">
                  @for (star of [5,4,3,2,1]; track star) {
                    <div class="rating-bar-row">
                      <span class="bar-label">{{ star }}</span>
                      <mat-icon class="star-xs star--filled">star</mat-icon>
                      <div class="bar-track">
                        <div class="bar-fill" [style.width.%]="getStarPercent(star)"></div>
                      </div>
                      <span class="bar-count">{{ getStarCount(star) }}</span>
                    </div>
                  }
                </div>
              </div>

              <mat-divider />

              <!-- Comentários anônimos -->
              <h4 class="comments-title">
                <mat-icon>comment</mat-icon>
                {{ 'APP.ANALYTICS.COMMENTS' | translate }}
              </h4>
              @if (isLoadingReviews()) {
                <div class="loading-center"><mat-spinner diameter="28" /></div>
              } @else if (reviews().length === 0) {
                <p class="text-muted">{{ 'APP.ANALYTICS.NO_COMMENTS' | translate }}</p>
              } @else {
                <div class="comments-list">
                  @for (review of reviews(); track review.id) {
                    <div class="comment-item">
                      <div class="comment-header">
                        <div class="comment-stars">
                          @for (star of [1,2,3,4,5]; track star) {
                            <mat-icon class="star-xs" [class.star--filled]="star <= review.rating">star</mat-icon>
                          }
                        </div>
                        <span class="comment-date text-muted">{{ review.createdAt | date:'dd/MM/yyyy' }}</span>
                        <span class="anonymous-badge">
                          <mat-icon class="anon-icon">person_off</mat-icon>
                          {{ 'APP.ANALYTICS.ANONYMOUS' | translate }}
                        </span>
                      </div>
                      @if (review.comment) {
                        <p class="comment-text">"{{ review.comment }}"</p>
                      } @else {
                        <p class="text-muted comment-text">{{ 'APP.ANALYTICS.NO_COMMENT_TEXT' | translate }}</p>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .analytics-wrapper { padding: 0; }
    .empty-analytics {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 40px 24px; color: var(--mat-sys-on-surface-variant); text-align: center;
    }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; }
    .loading-center { display: flex; justify-content: center; padding: 32px; }
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;
    }
    .kpi-card {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 16px 8px; border-radius: 12px; background: var(--mat-sys-surface-variant);
      text-align: center;
    }
    .kpi-icon { font-size: 28px; width: 28px; height: 28px; }
    .kpi-icon--blue { color: #3b82f6; }
    .kpi-icon--green { color: #22c55e; }
    .kpi-icon--purple { color: #a855f7; }
    .kpi-icon--red { color: #ef4444; }
    .kpi-value { font-size: 24px; font-weight: 800; color: var(--mat-sys-on-surface); }
    .kpi-label { font-size: 11px; color: var(--mat-sys-on-surface-variant); text-align: center; }
    .chart-container { padding: 16px 0; min-height: 280px; position: relative; }
    .chart-container canvas { width: 100% !important; }
    .reviews-analytics { padding: 16px 0; display: flex; flex-direction: column; gap: 16px; }
    .rating-summary { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
    .rating-big { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 80px; }
    .rating-number { font-size: 40px; font-weight: 900; color: var(--mat-sys-primary); }
    .rating-stars { display: flex; gap: 2px; }
    .rating-total { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .rating-bars { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .rating-bar-row { display: flex; align-items: center; gap: 6px; }
    .bar-label { font-size: 12px; width: 12px; text-align: right; }
    .bar-track { flex: 1; height: 8px; border-radius: 999px; background: var(--mat-sys-outline-variant); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 999px; background: #f59e0b; transition: width 0.4s ease; }
    .bar-count { font-size: 12px; width: 24px; text-align: right; color: var(--mat-sys-on-surface-variant); }
    .star-sm { font-size: 18px; width: 18px; height: 18px; color: var(--mat-sys-outline-variant); }
    .star-xs { font-size: 14px; width: 14px; height: 14px; color: var(--mat-sys-outline-variant); }
    .star--filled { color: #f59e0b; }
    .comments-title { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; margin: 0 0 8px; }
    .comments-title mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--mat-sys-primary); }
    .comments-list { display: flex; flex-direction: column; gap: 10px; }
    .comment-item {
      padding: 12px; border-radius: 10px; background: var(--mat-sys-surface-variant);
      border-left: 3px solid var(--mat-sys-primary);
    }
    .comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .comment-stars { display: flex; gap: 2px; }
    .comment-date { font-size: 11px; }
    .anonymous-badge {
      display: flex; align-items: center; gap: 3px; font-size: 11px;
      color: var(--mat-sys-on-surface-variant); margin-left: auto;
      background: var(--mat-sys-surface); padding: 2px 8px; border-radius: 999px;
    }
    .anon-icon { font-size: 13px; width: 13px; height: 13px; }
    .comment-text { font-size: 13px; font-style: italic; margin: 0; color: var(--mat-sys-on-surface-variant); }
    @media (max-width: 600px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .rating-summary { flex-direction: column; }
    }
  `],
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

    this.serviceApi.getAnalytics(this.service.id).subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.isLoading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.renderFunnelChart(data), 100);
        }
      },
      error: () => { this.isLoading.set(false); },
    });

    this.isLoadingReviews.set(true);
    this.reviewApi.findByService(this.service.id).subscribe({
      next: (list) => { this.reviews.set(list); this.isLoadingReviews.set(false); },
      error: () => { this.isLoadingReviews.set(false); },
    });
  }

  private async renderFunnelChart(data: ServiceAnalyticsDto): Promise<void> {
    if (!this.service) return;
    const echarts = await import('echarts');
    const canvasId = `funnel-chart-${this.service.id}`;
    const el = document.getElementById(canvasId);
    if (!el) return;

    if (this.chart) { this.chart.dispose(); }
    this.chart = echarts.init(el, undefined, { renderer: 'canvas', height: 260 });

    const isDark = document.documentElement.classList.contains('dark-theme');
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const bgColor = 'transparent';

    this.chart.setOption({
      backgroundColor: bgColor,
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [{
        type: 'funnel',
        left: '10%',
        width: '80%',
        min: 0,
        max: Math.max(data.clicks, 1),
        minSize: '20%',
        maxSize: '100%',
        sort: 'descending',
        gap: 6,
        label: { show: true, position: 'inside', color: '#fff', fontSize: 13, fontWeight: 'bold' },
        labelLine: { show: false },
        itemStyle: { borderWidth: 0, borderRadius: 4 },
        emphasis: { label: { fontSize: 14 } },
        data: [
          { value: data.clicks, name: 'Visualizações', itemStyle: { color: '#3b82f6' } },
          { value: data.interests, name: 'Interessados', itemStyle: { color: '#22c55e' } },
          { value: data.completions, name: 'Concluídos', itemStyle: { color: '#a855f7' } },
          { value: data.abandonments, name: 'Abandonados', itemStyle: { color: '#ef4444' } },
        ],
      }],
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
