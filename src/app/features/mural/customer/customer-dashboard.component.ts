import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import BaseComponent from '../../../components/base.component';
import { MuralTopbarComponent } from '../../../components/mural-topbar/mural-topbar.component';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { ServiceApiService, ServiceDto } from '../../../core/services/service-api.service';
import { AppointmentApiService, CreateAppointmentPayload, AvailableDate } from '../../../core/services/appointment-api.service';
import { ReviewApiService, AnonymousReviewDto, CreateReviewPayload } from '../../../core/services/review-api.service';
import { TranslateModule } from '@ngx-translate/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const CATEGORIES = [
  'Todas',
  'Beleza e Estética',
  'Manutenção e Reparos',
  'Alimentação',
  'Aulas e Tutoria',
  'Pets',
  'Limpeza',
  'Tecnologia',
  'Saúde e Bem-estar',
  'Outros',
];

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslateModule,
    MuralTopbarComponent,
  ],
  template: `
    <div class="customer-layout">
      <app-mural-topbar
        role="customer"
        [userName]="user?.givenName || user?.displayName || ''"
        (logout)="onLogout()"
      />

      <main class="customer-main">
        <!-- Hero -->
        <section class="hero-section">
          <div>
            <h1 class="hero-title">{{ 'APP.CUSTOMER.HERO_TITLE' | translate }}</h1>
            <p class="text-muted">
              {{ 'APP.CUSTOMER.HERO_SUBTITLE' | translate }}
              <strong>{{ condoCity }}</strong>.
            </p>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-value">{{ totalServices }}</span>
              <span class="text-muted">{{ 'APP.CUSTOMER.STATS_SERVICES' | translate }}</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-value">{{ uniqueProviders() }}</span>
              <span class="text-muted">{{ 'APP.CUSTOMER.STATS_PROVIDERS' | translate }}</span>
            </div>
          </div>
        </section>

        <!-- Filtros -->
        <section class="filters-section">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>{{ 'APP.CUSTOMER.SEARCH_PLACEHOLDER' | translate }}</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [formControl]="searchControl" />
          </mat-form-field>
          <div class="category-chips">
            <button class="cat-chip" [class.cat-chip--active]="selectedCategory() === 'Todas'"
              (click)="selectCategory('')">
              {{ 'APP.CUSTOMER.FILTER_ALL' | translate }}
            </button>
            @for (cat of categories; track cat) {
              <button class="cat-chip" [class.cat-chip--active]="selectedCategory() === cat"
                (click)="selectCategory(cat)" type="button">{{ cat }}</button>
            }
          </div>
        </section>

        <!-- Mural -->
        @if (isLoadingServices()) {
          <div class="loading-center"><mat-spinner diameter="48" /></div>
        } @else if (filteredServices().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <p>{{ 'APP.CUSTOMER.NO_SERVICES' | translate }}</p>
            <span class="text-muted">{{ 'APP.CUSTOMER.NO_SERVICES_HINT' | translate }}</span>
          </div>
        } @else {
          <section class="mural-grid">
            @for (service of filteredServices(); track service.id) {
              <mat-card class="mural-card surface-card" [class.mural-card--expanded]="expandedId() === service.id">
                <mat-card-content>
                  <div class="card-header">
                    <div>
                      <h3 class="card-title">{{ service.name }}</h3>
                      <span class="category-badge">{{ service.category }}</span>
                    </div>
                    <div class="card-rating">
                      <mat-icon class="star-icon star--filled">star</mat-icon>
                      <span class="rating-value">{{ service.rating | number:'1.1-1' }}</span>
                      <span class="text-muted">({{ service.totalReviews }})</span>
                    </div>
                  </div>
                  <p class="card-description text-muted">{{ service.description }}</p>
                  <div class="card-meta">
                    <span class="card-price">{{ service.price }}</span>
                    <div class="card-days">
                      @for (day of service.availableDays.slice(0,3); track day) {
                        <span class="day-badge">{{ day }}</span>
                      }
                      @if (service.availableDays.length > 3) {
                        <span class="day-badge day-badge--more">+{{ service.availableDays.length - 3 }}</span>
                      }
                    </div>
                  </div>
                  <div class="card-actions">
                    <button mat-stroked-button color="primary" (click)="contactWhatsApp(service)">
                      <mat-icon>whatsapp</mat-icon>
                      {{ 'APP.CUSTOMER.CONTACT' | translate }}
                    </button>
                    <button mat-raised-button color="primary" (click)="toggleExpand(service)">
                      <mat-icon>{{ expandedId() === service.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                      {{ 'APP.CUSTOMER.SCHEDULE' | translate }}
                    </button>
                  </div>
                  @if (expandedId() === service.id) {
                    <mat-divider class="m-y-3" />

                    <!-- Calendário de agendamento -->
                    <h4 class="details-title">
                      <mat-icon class="details-icon">event</mat-icon>
                      {{ 'APP.CUSTOMER.SCHEDULE_TITLE' | translate }}
                    </h4>

                    @if (isLoadingDates() === service.id) {
                      <div class="loading-center"><mat-spinner diameter="28" /></div>
                    } @else if (availableDatesMap()[service.id]?.length === 0) {
                      <p class="text-muted">{{ 'APP.CUSTOMER.NO_AVAILABLE_DATES' | translate }}</p>
                    } @else if (availableDatesMap()[service.id]) {
                      <div class="calendar-grid">
                        @for (dateInfo of availableDatesMap()[service.id]; track dateInfo.date) {
                          <button class="calendar-day-btn"
                            [class.calendar-day-btn--selected]="getSelectedDate(service.id) === dateInfo.date"
                            (click)="selectDate(service.id, dateInfo.date)">
                            <span class="cal-day-name">{{ dateInfo.day }}</span>
                            <span class="cal-day-date">{{ formatDate(dateInfo.date) }}</span>
                          </button>
                        }
                      </div>

                      @if (getSelectedDate(service.id)) {
                        <div class="slots-row">
                          <span class="text-muted" style="font-size:13px">Horário:</span>
                          @for (slot of getSlotsForDate(service.id, getSelectedDate(service.id)!); track slot) {
                            <button class="slot-btn"
                              [class.slot-btn--selected]="getSelectedSlot(service.id) === slot"
                              (click)="selectSlot(service.id, slot)">{{ slot }}</button>
                          }
                          @if (getSlotsForDate(service.id, getSelectedDate(service.id)!).length === 0) {
                            <span class="text-muted" style="font-size:13px">Qualquer horário</span>
                          }
                        </div>

                        <div class="booking-summary">
                          @if ((service)?.priceInCents) {
                            <div class="price-display">
                              <mat-icon>payments</mat-icon>
                              <span>{{ formatPrice((service)?.priceInCents || 0) }}</span>
                              <span class="text-muted" style="font-size:12px">(5% taxa de serviço incluída)</span>
                            </div>
                          }
                          <button mat-raised-button color="accent" class="w-full"
                            [disabled]="isScheduling() === service.id"
                            (click)="onScheduleAndPay(service)">
                            @if (isScheduling() === service.id) { <mat-spinner diameter="18" /> }
                            <mat-icon>{{ (service)?.priceInCents ? 'payment' : 'event_available' }}</mat-icon>
                            {{ (service)?.priceInCents ? ('APP.CUSTOMER.SCHEDULE_AND_PAY' | translate) : ('APP.CUSTOMER.SCHEDULE_CONFIRM' | translate) }}
                          </button>
                        </div>
                      }
                    } @else {
                      <button mat-stroked-button (click)="loadAvailableDates(service.id)" style="width:100%">
                        <mat-icon>calendar_today</mat-icon>
                        {{ 'APP.CUSTOMER.LOAD_DATES' | translate }}
                      </button>
                    }

                    <mat-divider class="m-y-3" />

                    <!-- Avaliações anônimas -->
                    <h4 class="details-title">
                      <mat-icon class="details-icon">star_rate</mat-icon>
                      {{ 'APP.CUSTOMER.REVIEWS_TITLE' | translate }}
                    </h4>

                    @if (service.totalReviews > 0) {
                      <div class="reviews-summary">
                        <span class="review-rating-value">{{ service.rating | number:'1.1-1' }}</span>
                        <div class="review-stars">
                          @for (star of [1,2,3,4,5]; track star) {
                            <mat-icon class="star-icon" [class.star--filled]="star <= service.rating">star</mat-icon>
                          }
                        </div>
                        <span class="text-muted">{{ service.totalReviews }} {{ 'APP.CUSTOMER.RATING' | translate }}</span>
                      </div>
                    }

                    @if (isLoadingReviews() === service.id) {
                      <div class="loading-center"><mat-spinner diameter="28" /></div>
                    } @else if (reviewsMap()[service.id]?.length) {
                      <div class="reviews-list">
                        @for (review of reviewsMap()[service.id]; track review.id) {
                          <div class="review-item">
                            <div class="review-stars-row">
                              @for (star of [1,2,3,4,5]; track star) {
                                <mat-icon class="star-icon-sm" [class.star--filled]="star <= review.rating">star</mat-icon>
                              }
                              <span class="review-date text-muted">{{ review.createdAt | date:'dd/MM/yyyy' }}</span>
                            </div>
                            @if (review.comment) {
                              <p class="review-comment">"{{ review.comment }}"</p>
                            }
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-muted">{{ 'APP.CUSTOMER.NO_REVIEWS' | translate }}</p>
                    }

                    <mat-divider class="m-y-3" />

                    <!-- Formulário de avaliação anônima -->
                    <h4 class="details-title">
                      <mat-icon class="details-icon">rate_review</mat-icon>
                      {{ 'APP.CUSTOMER.WRITE_REVIEW' | translate }}
                    </h4>
                    <div class="review-form">
                      <div class="star-selector">
                        <span class="text-muted">{{ 'APP.CUSTOMER.YOUR_RATING' | translate }}</span>
                        <div class="star-selector-stars">
                          @for (star of [1,2,3,4,5]; track star) {
                            <button class="star-btn" type="button"
                              (mouseenter)="hoverStar(service.id, star)"
                              (mouseleave)="hoverStar(service.id, 0)"
                              (click)="setRating(service.id, star)">
                              <mat-icon class="star-icon-lg"
                                [class.star--filled]="star <= (hoverRating()[service.id] || pendingRating()[service.id] || 0)">
                                star
                              </mat-icon>
                            </button>
                          }
                        </div>
                        @if (pendingRating()[service.id]) {
                          <span class="rating-label-text">{{ getRatingLabel(pendingRating()[service.id]) }}</span>
                        }
                      </div>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.CUSTOMER.REVIEW_COMMENT' | translate }}</mat-label>
                        <textarea matInput rows="3" maxlength="500"
                          [value]="pendingComment()[service.id] || ''"
                          (input)="setComment(service.id, $any($event.target).value)"
                          [placeholder]="'APP.CUSTOMER.REVIEW_COMMENT_HINT' | translate"></textarea>
                        <mat-hint>{{ 'APP.CUSTOMER.REVIEW_ANONYMOUS_HINT' | translate }}</mat-hint>
                      </mat-form-field>
                      <button mat-raised-button color="primary" class="w-full" type="button"
                        [disabled]="!pendingRating()[service.id] || isReviewing() === service.id"
                        (click)="submitReview(service)">
                        @if (isReviewing() === service.id) { <mat-spinner diameter="18" /> }
                        <mat-icon>send</mat-icon>
                        {{ 'APP.CUSTOMER.SUBMIT_REVIEW' | translate }}
                      </button>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            }
          </section>
        }
        <!-- Seção: Meus Agendamentos -->
        @if (myAppointments().length > 0) {
          <section class="my-appointments-section">
            <h2 class="section-title">
              <mat-icon>event_note</mat-icon>
              {{ 'APP.CUSTOMER.MY_APPOINTMENTS' | translate }}
            </h2>
            <div class="appointments-list">
              @for (appt of myAppointments(); track appt.id) {
                <mat-card class="appointment-card surface-card">
                  <mat-card-content>
                    <div class="appt-header">
                      <div>
                        <h4 class="appt-service-name">{{ appt.service?.name }}</h4>
                        <span class="appt-date">{{ appt.scheduledDate | date:'dd/MM/yyyy' }}
                          @if (appt.scheduledSlot) { · {{ appt.scheduledSlot }} }
                        </span>
                      </div>
                      <span class="appt-status-badge" [style.background]="getStatusColor(appt.status) + '22'" [style.color]="getStatusColor(appt.status)">
                        {{ getStatusLabel(appt.status) }}
                      </span>
                    </div>
                    @if (appt.amountInCents) {
                      <p class="appt-price">{{ formatPrice(appt.amountInCents) }}</p>
                    }
                    <div class="appt-actions">
                      @if (appt.status === 'confirmed' || appt.status === 'in_progress') {
                        <button mat-raised-button color="primary"
                          [disabled]="isConfirmingCompletion() === appt.id"
                          (click)="confirmServiceCompleted(appt.id)">
                          @if (isConfirmingCompletion() === appt.id) { <mat-spinner diameter="16" /> }
                          <mat-icon>check_circle</mat-icon>
                          {{ 'APP.CUSTOMER.CONFIRM_COMPLETED' | translate }}
                        </button>
                        <button mat-stroked-button color="warn"
                          [disabled]="isCancelling() === appt.id"
                          (click)="cancelAppointment(appt.id)">
                          @if (isCancelling() === appt.id) { <mat-spinner diameter="16" /> }
                          <mat-icon>cancel</mat-icon>
                          {{ 'APP.CUSTOMER.CANCEL_APPOINTMENT' | translate }}
                        </button>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </section>
        }
      </main>

      <!-- Modal de Pagamento Stripe -->
      @if (showPaymentModal()) {
        <div class="payment-modal-overlay" (click)="closePaymentModal()">
          <div class="payment-modal" (click)="$event.stopPropagation()">
            <div class="payment-modal-header">
              <h3>
                <mat-icon>payment</mat-icon>
                {{ 'APP.CUSTOMER.PAYMENT_TITLE' | translate }}
              </h3>
              <button mat-icon-button (click)="closePaymentModal()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="payment-modal-body">
              <div class="payment-amount">
                <span class="text-muted">{{ 'APP.CUSTOMER.PAYMENT_AMOUNT' | translate }}</span>
                <span class="payment-amount-value">{{ formatPrice(paymentAmountInCents()) }}</span>
              </div>
              <div class="payment-info-box">
                <mat-icon style="font-size:16px;width:16px;height:16px;color:var(--mat-sys-primary)">info</mat-icon>
                <span>{{ 'APP.CUSTOMER.PAYMENT_ESCROW_INFO' | translate }}</span>
              </div>
              <!-- Stripe Payment Element será montado aqui -->
              <div id="stripe-payment-element" class="stripe-element-container"></div>
              @if (paymentError()) {
                <p class="payment-error">{{ paymentError() }}</p>
              }
              <button mat-raised-button color="primary" class="w-full payment-confirm-btn"
                [disabled]="isProcessingPayment()"
                (click)="confirmPayment()">
                @if (isProcessingPayment()) { <mat-spinner diameter="20" /> }
                <mat-icon>lock</mat-icon>
                {{ 'APP.CUSTOMER.PAYMENT_CONFIRM' | translate }}
              </button>
              <p class="payment-security-note">
                <mat-icon style="font-size:14px;width:14px;height:14px">security</mat-icon>
                {{ 'APP.CUSTOMER.PAYMENT_SECURITY' | translate }}
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .customer-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .customer-main {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .hero-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }
    .hero-title {
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 6px;
    }
    .hero-stats {
      display: flex;
      gap: 24px;
      flex-shrink: 0;
    }
    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .hero-stat-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--mat-sys-primary);
    }
    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .search-field {
      width: 100%;
    }
    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cat-chip {
      padding: 6px 16px;
      border-radius: 999px;
      border: 1.5px solid var(--mat-sys-outline-variant);
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--mat-sys-on-surface-variant);
    }
    .cat-chip:hover {
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-primary);
    }
    .cat-chip--active {
      background: var(--mat-sys-primary);
      border-color: var(--mat-sys-primary);
      color: white;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 60px 24px;
      border: 2px dashed var(--mat-sys-outline-variant);
      border-radius: 16px;
      text-align: center;
    }
    .empty-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--mat-sys-on-surface-variant);
    }
    .mural-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
      align-items: start;
    }
    .mural-card {
      padding: 20px;
      transition: box-shadow 0.2s;
    }
    .mural-card--expanded {
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    }
    .category-badge {
      font-size: 11px; padding: 2px 8px; border-radius: 999px;
      background: color-mix(in oklab, var(--mat-sys-primary) 12%, transparent);
      color: var(--mat-sys-primary); font-weight: 600;
    }
    .rating-row {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .star-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mat-sys-outline-variant);
    }
    .star--filled {
      color: #f59e0b;
    }
    .rating-label {
      font-size: 12px;
      margin-left: 4px;
    }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .card-title { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
    .card-rating { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 600; }
    .card-description { font-size: 14px; margin: 8px 0; line-height: 1.5; }
    .card-meta { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; }
    .card-price { font-weight: 700; color: var(--mat-sys-primary); font-size: 15px; }
    .card-days { display: flex; gap: 4px; flex-wrap: wrap; }
    .day-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: var(--mat-sys-surface-variant); color: var(--mat-sys-on-surface-variant); }
    .day-badge--more { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .card-actions { display: flex; gap: 8px; margin-top: 12px; }
    .card-actions button { flex: 1; }
    .details-title { font-size: 14px; font-weight: 700; margin: 0 0 8px; }
    .days-picker { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
    .day-pick-btn { padding: 6px 14px; border-radius: 999px; border: 1.5px solid var(--mat-sys-outline-variant); background: transparent; cursor: pointer; font-size: 13px; transition: all 0.15s; color: var(--mat-sys-on-surface); }
    .day-pick-btn:hover { border-color: var(--mat-sys-primary); color: var(--mat-sys-primary); }
    .day-pick-btn--selected { background: var(--mat-sys-primary); border-color: var(--mat-sys-primary); color: white; }
    .reviews-summary { display: flex; align-items: center; gap: 12px; }
    .review-rating-value { font-size: 32px; font-weight: 800; }
    .review-stars { display: flex; }
    .details-title { font-size: 14px; font-weight: 700; margin: 0 0 8px; display: flex; align-items: center; gap: 6px; }
    .details-icon { font-size: 18px; width: 18px; height: 18px; color: var(--mat-sys-primary); }
    .star-icon-sm { font-size: 14px; width: 14px; height: 14px; color: var(--mat-sys-outline-variant); }
    .star-icon-lg { font-size: 28px; width: 28px; height: 28px; color: var(--mat-sys-outline-variant); transition: color 0.1s; }
    .reviews-list { display: flex; flex-direction: column; gap: 10px; margin: 10px 0; }
    .review-item { padding: 10px 12px; border-radius: 10px; background: var(--mat-sys-surface-variant); border-left: 3px solid var(--mat-sys-primary); }
    .review-stars-row { display: flex; align-items: center; gap: 2px; margin-bottom: 4px; }
    .review-date { font-size: 11px; margin-left: auto; }
    .review-comment { font-size: 13px; margin: 4px 0 0; font-style: italic; color: var(--mat-sys-on-surface-variant); }
    .review-form { display: flex; flex-direction: column; gap: 12px; }
    .star-selector { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .star-selector-stars { display: flex; gap: 4px; }
    .star-btn { background: none; border: none; cursor: pointer; padding: 2px; line-height: 0; }
    .rating-label-text { font-size: 13px; font-weight: 600; color: var(--mat-sys-primary); }
    @media (max-width: 768px) {
      .hero-section { flex-direction: column; align-items: flex-start; }
      .hero-stats { align-self: flex-start; }
      .customer-main { padding: 16px; gap: 20px; }
    }
    @media (max-width: 600px) {
      .mural-grid { grid-template-columns: 1fr; }
      .card-actions { flex-direction: column; }
      .card-actions button { width: 100%; flex: none; }
      .card-meta { flex-direction: column; align-items: flex-start; gap: 6px; }
      .hero-stat-value { font-size: 22px; }
      .category-chips { gap: 6px; }
      .cat-chip { padding: 5px 12px; font-size: 12px; }
      .reviews-summary { flex-direction: column; align-items: flex-start; }
    }
    @media (max-width: 400px) {
      .hero-stats { flex-direction: column; gap: 8px; }
    }
    /* ── Calendário ── */
    .calendar-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .calendar-day-btn { display: flex; flex-direction: column; align-items: center; padding: 8px 12px; border-radius: 10px; border: 1.5px solid var(--mat-sys-outline-variant); background: transparent; cursor: pointer; font-size: 12px; transition: all 0.15s; min-width: 72px; }
    .calendar-day-btn:hover { border-color: var(--mat-sys-primary); background: color-mix(in oklab, var(--mat-sys-primary) 8%, transparent); }
    .calendar-day-btn--selected { border-color: var(--mat-sys-primary); background: color-mix(in oklab, var(--mat-sys-primary) 15%, transparent); color: var(--mat-sys-primary); }
    .cal-day-name { font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .cal-day-date { font-size: 12px; margin-top: 2px; }
    .slots-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .slot-btn { padding: 6px 14px; border-radius: 999px; border: 1.5px solid var(--mat-sys-outline-variant); background: transparent; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s; }
    .slot-btn:hover { border-color: var(--mat-sys-primary); color: var(--mat-sys-primary); }
    .slot-btn--selected { background: var(--mat-sys-primary); border-color: var(--mat-sys-primary); color: white; }
    .booking-summary { display: flex; flex-direction: column; gap: 10px; }
    .price-display { display: flex; align-items: center; gap: 6px; font-size: 18px; font-weight: 700; color: var(--mat-sys-primary); }
    /* ── Meus Agendamentos ── */
    .my-appointments-section { display: flex; flex-direction: column; gap: 12px; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; margin: 0; }
    .appointments-list { display: flex; flex-direction: column; gap: 10px; }
    .appointment-card { padding: 16px; }
    .appt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .appt-service-name { font-size: 15px; font-weight: 700; margin: 0 0 2px; }
    .appt-date { font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .appt-status-badge { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
    .appt-price { font-size: 14px; font-weight: 600; color: var(--mat-sys-primary); margin: 4px 0 8px; }
    .appt-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    /* ── Modal de Pagamento ── */
    .payment-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
    .payment-modal { background: var(--mat-sys-surface); border-radius: 20px; width: 100%; max-width: 480px; box-shadow: 0 24px 64px rgba(0,0,0,0.3); }
    .payment-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 0; }
    .payment-modal-header h3 { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; margin: 0; }
    .payment-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .payment-amount { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: color-mix(in oklab, var(--mat-sys-primary) 8%, transparent); border-radius: 10px; }
    .payment-amount-value { font-size: 22px; font-weight: 800; color: var(--mat-sys-primary); }
    .payment-info-box { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--mat-sys-on-surface-variant); padding: 10px 12px; background: color-mix(in oklab, var(--mat-sys-primary) 5%, transparent); border-radius: 8px; }
    .stripe-element-container { min-height: 60px; padding: 12px; border: 1.5px solid var(--mat-sys-outline-variant); border-radius: 10px; }
    .payment-error { color: #ef4444; font-size: 13px; margin: 0; }
    .payment-confirm-btn { height: 48px; font-size: 15px; font-weight: 700; }
    .payment-security-note { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 12px; color: var(--mat-sys-on-surface-variant); margin: 0; }
  `],
})
export class CustomerDashboardComponent extends BaseComponent implements OnInit {
  private readonly onboardingService = inject(OnboardingService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly reviewApi = inject(ReviewApiService);

  allServices = signal<ServiceDto[]>([]);
  selectedCategory = signal('Todas');
  expandedId = signal<string | null>(null);
  selectedDay = signal<string | null>(null);
  isLoadingServices = signal(false);
  isScheduling = signal<string | null>(null);
  isReviewing = signal<string | null>(null);
  isLoadingReviews = signal<string | null>(null);

  // ── Estado de calendário e agendamento ──────────────────────────────────────────
  availableDatesMap = signal<Record<string, AvailableDate[]>>({});
  isLoadingDates = signal<string | null>(null);
  selectedDate = signal<string | null>(null);
  selectedSlot = signal<string | null>(null);
  pendingAppointmentId = signal<string | null>(null);

  // ── Estado de pagamento Stripe ────────────────────────────────────────────────────
  showPaymentModal = signal(false);
  isProcessingPayment = signal(false);
  paymentClientSecret = signal<string | null>(null);
  paymentAmountInCents = signal<number>(0);
  paymentAppointmentId = signal<string | null>(null);
  paymentError = signal<string | null>(null);
  private stripe: Stripe | null = null;
  private stripeElements: StripeElements | null = null;
  private cardElement: any = null;

  // ── Estado de confirmação de conclusão ─────────────────────────────────────────────
  myAppointments = signal<any[]>([]);
  isConfirmingCompletion = signal<string | null>(null);
  isCancelling = signal<string | null>(null);

  // ── Estado de avaliação ────────────────────────────────────────────────────────
  reviewsMap = signal<Record<string, any[]>>({});
  pendingRating = signal<Record<string, number>>({});
  pendingComment = signal<Record<string, string>>({});
  hoverRating = signal<Record<string, number>>({});
  searchControl = new FormControl('');
  private readonly searchValue = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  readonly categories = [...CATEGORIES];
  readonly weekdays = WEEKDAYS;

  uniqueProviders = computed(() => {
    const ids = new Set(this.allServices().map((s) => s.providerId));
    return ids.size;
  });

  filteredServices = computed(() => {
    let list = this.allServices();
    const cat = this.selectedCategory();
    const day = this.selectedDay();
    const search = (this.searchValue() ?? '').toLowerCase().trim();
    if (cat && cat !== 'Todas') {
      list = list.filter((s) => s.category === cat);
    }
    if (day) {
      list = list.filter((s) => s.availableDays.includes(day));
    }
    if (search) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search) ||
          s.category.toLowerCase().includes(search),
      );
    }
    return list;
  });

  get totalServices(): number {
    return this.allServices().length;
  }

  get condoCity(): string {
    return this.onboardingService.profile.condominiumAddress?.city || 'Não definido';
  }

  constructor() {
    super({ loadUnit: false });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.serviceApi.findAll().subscribe({
      next: (list) => {
        this.allServices.set(list);
        this.isLoadingServices.set(false);
      },
      error: () => {
        this.isLoadingServices.set(false);
      },
    });
  }

  toggleExpand(service: ServiceDto): void {
    const isOpening = this.expandedId() !== service.id;
    this.expandedId.set(isOpening ? service.id : null);
    if (isOpening) {
      this.serviceApi.trackMetric(service.id, 'clicks').subscribe();
      this.loadReviews(service.id);
    }
  }

  private loadReviews(serviceId: string): void {
    if (this.reviewsMap()[serviceId]) return;
    this.isLoadingReviews.set(serviceId);
    this.reviewApi.findByService(serviceId).subscribe({
      next: (reviews) => {
        this.reviewsMap.update((m) => ({ ...m, [serviceId]: reviews }));
        this.isLoadingReviews.set(null);
      },
      error: () => { this.isLoadingReviews.set(null); },
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  filterByCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  onContact(service: ServiceDto): void {
    this.contactWhatsApp(service);
  }

  /** Seleciona/deseleciona um dia para agendamento (chave = day + serviceId) */
  selectDay(key: string): void {
    this.selectedDay.set(this.selectedDay() === key ? null : key);
  }

  /** Confirma o agendamento do serviço com o dia selecionado */
  onSchedule(service: ServiceDto): void {
    const key = this.selectedDay();
    if (!key) return;
    // A chave é day + serviceId; extrai o dia removendo o serviceId do final
    const day = key.replace(service.id, '');
    this.scheduleService(service, day);
    this.selectedDay.set(null);
  }

  filterByDay(day: string): void {
    this.selectedDay.set(this.selectedDay() === day ? null : day);
  }

  contactWhatsApp(service: ServiceDto): void {
    this.serviceApi.trackMetric(service.id, 'interests').subscribe();
    const phone = service.contact.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá! Vi seu serviço "${service.name}" no Mural do Condomínio e gostaria de mais informações.`,
    );
    const url = `https://wa.me/55${phone}?text=${message}`;
    window.open(url, '_blank');
  }

  // ── Calendário de disponibilidade ────────────────────────────────────────────────────

  /** Carrega os dias disponíveis do serviço ao expandir o card */
  loadAvailableDates(serviceId: string): void {
    if (this.availableDatesMap()[serviceId]) return;
    this.isLoadingDates.set(serviceId);
    this.appointmentApi.getAvailableDates(serviceId, 30).subscribe({
      next: (dates) => {
        this.availableDatesMap.update((m) => ({ ...m, [serviceId]: dates }));
        this.isLoadingDates.set(null);
      },
      error: () => { this.isLoadingDates.set(null); },
    });
  }

  selectDate(serviceId: string, date: string): void {
    const key = serviceId + '|' + date;
    this.selectedDate.set(this.selectedDate() === key ? null : key);
    this.selectedSlot.set(null);
  }

  selectSlot(serviceId: string, slot: string): void {
    const key = serviceId + '|' + slot;
    this.selectedSlot.set(this.selectedSlot() === key ? null : key);
  }

  getSelectedDate(serviceId: string): string | null {
    const key = this.selectedDate();
    if (!key?.startsWith(serviceId + '|')) return null;
    return key.split('|')[1];
  }

  getSelectedSlot(serviceId: string): string | null {
    const key = this.selectedSlot();
    if (!key?.startsWith(serviceId + '|')) return null;
    return key.split('|')[1];
  }

  getSlotsForDate(serviceId: string, date: string): string[] {
    const dates = this.availableDatesMap()[serviceId] ?? [];
    return dates.find((d) => d.date === date)?.slots ?? [];
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /** Cria o agendamento e inicia o pagamento */
  onScheduleAndPay(service: ServiceDto): void {
    const date = this.getSelectedDate(service.id);
    const slot = this.getSelectedSlot(service.id);
    if (!date) return;

    const dates = this.availableDatesMap()[service.id] ?? [];
    const dayInfo = dates.find((d) => d.date === date);
    const dayName = dayInfo?.day ?? date;

    this.isScheduling.set(service.id);
    const payload: CreateAppointmentPayload = {
      serviceId: service.id,
      scheduledDate: date,
      scheduledDay: dayName,
      scheduledSlot: slot ?? undefined,
    };

    this.appointmentApi.create(payload).subscribe({
      next: (appointment) => {
        this.isScheduling.set(null);
        this.pendingAppointmentId.set(appointment.id);
        if ((service as any).priceInCents && (service as any).priceInCents > 0) {
          this.initiatePayment(appointment.id, (service as any).priceInCents);
        } else {
          this.selectedDate.set(null);
          this.selectedSlot.set(null);
        }
      },
      error: () => { this.isScheduling.set(null); },
    });
  }

  // ── Pagamento Stripe ────────────────────────────────────────────────────────────────

  private initiatePayment(appointmentId: string, amountInCents: number): void {
    this.appointmentApi.initiatePayment(appointmentId).subscribe({
      next: async (res) => {
        this.paymentClientSecret.set(res.clientSecret);
        this.paymentAmountInCents.set(res.amountInCents);
        this.paymentAppointmentId.set(appointmentId);
        this.paymentError.set(null);
        this.showPaymentModal.set(true);
        setTimeout(() => this.initStripeElements(), 200);
      },
    });
  }

  private async initStripeElements(): Promise<void> {
    const publishableKey = (window as any).__STRIPE_PUBLISHABLE_KEY__ || 'pk_test_placeholder';
    this.stripe = await loadStripe(publishableKey);
    if (!this.stripe) return;
    this.stripeElements = this.stripe.elements({ clientSecret: this.paymentClientSecret()! });
    this.cardElement = this.stripeElements.create('payment');
    this.cardElement.mount('#stripe-payment-element');
  }

  async confirmPayment(): Promise<void> {
    if (!this.stripe || !this.stripeElements) return;
    this.isProcessingPayment.set(true);
    this.paymentError.set(null);
    const { error } = await this.stripe.confirmPayment({
      elements: this.stripeElements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (error) {
      this.paymentError.set(error.message ?? 'Erro ao processar pagamento.');
      this.isProcessingPayment.set(false);
    } else {
      this.isProcessingPayment.set(false);
      this.showPaymentModal.set(false);
      this.selectedDate.set(null);
      this.selectedSlot.set(null);
      this.loadMyAppointments();
    }
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    if (this.cardElement) { this.cardElement.destroy(); this.cardElement = null; }
  }

  // ── Meus agendamentos ────────────────────────────────────────────────────────────────

  loadMyAppointments(): void {
    this.appointmentApi.findMine().subscribe({
      next: (list) => this.myAppointments.set(list),
    });
  }

  confirmServiceCompleted(appointmentId: string): void {
    this.isConfirmingCompletion.set(appointmentId);
    this.appointmentApi.confirmCompleted(appointmentId).subscribe({
      next: (updated) => {
        this.isConfirmingCompletion.set(null);
        this.myAppointments.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      },
      error: () => { this.isConfirmingCompletion.set(null); },
    });
  }

  cancelAppointment(appointmentId: string): void {
    this.isCancelling.set(appointmentId);
    this.appointmentApi.cancel(appointmentId).subscribe({
      next: (updated) => {
        this.isCancelling.set(null);
        this.myAppointments.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      },
      error: () => { this.isCancelling.set(null); },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending_payment: 'Aguardando pagamento',
      confirmed: 'Confirmado',
      in_progress: 'Em andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return labels[status] ?? status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending_payment: '#f59e0b',
      confirmed: '#3b82f6',
      in_progress: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444',
      refunded: '#6b7280',
    };
    return colors[status] ?? '#6b7280';
  }

  scheduleService(service: ServiceDto, day: string): void {
    this.onScheduleAndPay(service);
  }

  // ── Avaliação anônima ────────────────────────────────────────────────────
  hoverStar(serviceId: string, star: number): void {
    this.hoverRating.update((m) => ({ ...m, [serviceId]: star }));
  }

  setRating(serviceId: string, star: number): void {
    this.pendingRating.update((m) => ({ ...m, [serviceId]: star }));
  }

  setComment(serviceId: string, text: string): void {
    this.pendingComment.update((m) => ({ ...m, [serviceId]: text }));
  }

  getRatingLabel(rating: number): string {
    const labels: Record<number, string> = {
      1: 'Péssimo', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Excelente',
    };
    return labels[rating] ?? '';
  }

  submitReview(service: ServiceDto): void {
    const rating = this.pendingRating()[service.id];
    if (!rating) return;
    this.isReviewing.set(service.id);
    const payload: CreateReviewPayload = {
      serviceId: service.id,
      rating,
      comment: this.pendingComment()[service.id] || undefined,
    };
    this.reviewApi.create(payload).subscribe({
      next: (newReview) => {
        this.isReviewing.set(null);
        this.pendingRating.update((m) => ({ ...m, [service.id]: 0 }));
        this.pendingComment.update((m) => ({ ...m, [service.id]: '' }));
        this.reviewsMap.update((m) => ({
          ...m,
          [service.id]: [newReview, ...(m[service.id] ?? [])],
        }));
        this.serviceApi.findOne(service.id).subscribe({
          next: (updated) => {
            this.allServices.update((list) =>
              list.map((s) => (s.id === updated.id ? updated : s)),
            );
          },
        });
      },
      error: () => { this.isReviewing.set(null); },
    });
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
