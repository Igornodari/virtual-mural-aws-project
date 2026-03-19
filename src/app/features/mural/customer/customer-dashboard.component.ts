import { Component } from '@angular/core';
import BaseComponent from 'src/app/components/base.component';
import { MuralTopbarComponent } from 'src/app/components/mural-topbar/mural-topbar.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';

type ReviewDto = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string | Date;
};

type ServiceDto = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  contact: string;
  availableDays: string[];
  rating: number;
  totalReviews: number;
};

@Component({
  selector: 'app-customer-dashboard',
  imports: [...importBase,MuralTopbarComponent],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
})
export class CustomerDashboardComponent extends BaseComponent {
  categories: string[] = [];
  selectedCategory = 'Todos';

  filteredServices: ServiceDto[] = [];
  totalServices = 0;
  uniqueProviders = 0;
  condoCity = '';

  expandedServiceId: string | null = null;
  isLoadingReviews: string | null = null;

  reviewsMap: Record<string, ReviewDto[]> = {};
  showAllReviews: Record<string, boolean> = {};

  constructor() {
    super();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  toggleExpand(serviceId: string): void {
    this.expandedServiceId = this.expandedServiceId === serviceId ? null : serviceId;

    if (this.expandedServiceId && !this.reviewsMap[serviceId]) {
      this.loadReviews(serviceId);
    }
  }

  toggleShowAllReviews(serviceId: string): void {
    this.showAllReviews[serviceId] = !this.showAllReviews[serviceId];
  }

  getVisibleReviews(serviceId: string): ReviewDto[] {
    const reviews = this.reviewsMap[serviceId] || [];
    return this.showAllReviews[serviceId] ? reviews : reviews.slice(0, 3);
  }

  private applyFilters(): void {
    // manter sua lógica existente aqui
  }

  private loadReviews(serviceId: string): void {
    this.isLoadingReviews = serviceId;

    // substituir pela sua chamada real de API
    // exemplo:
    // this.reviewApi.findByService(serviceId).subscribe({
    //   next: (reviews) => {
    //     this.reviewsMap[serviceId] = reviews;
    //     this.isLoadingReviews = null;
    //   },
    //   error: () => {
    //     this.isLoadingReviews = null;
    //   }
    // });

    this.isLoadingReviews = null;
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
