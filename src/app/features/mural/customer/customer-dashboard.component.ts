import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import BaseComponent from 'src/app/components/base.component';

import { ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { AppUserProfileDto } from 'src/app/core/services/user-api.service';

import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from 'src/app/shared/components/loading-state/loading-state.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';

import { CustomerFiltersComponent } from './components/customer-filters/customer-filters.component';
import { CustomerHeroComponent } from './components/customer-hero/customer-hero.component';

import {
  CustomerServiceDetailsDialog,
  CustomerServiceDetailsDialogData,
  CustomerServiceDetailsDialogResult,
} from './components/customer-service-details/customer-service-details-dialog.component';

import { CUSTOMER_ALL_CATEGORY, CUSTOMER_CATEGORIES } from './customer.constants';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    ...importBase,
    ServiceCardComponent,
    CustomerFiltersComponent,
    CustomerHeroComponent,
    EmptyStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
})
export class CustomerDashboardComponent extends BaseComponent implements OnInit {
  private readonly serviceApi = inject(ServiceApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(SnackBarService);

  public services: ServiceDto[] = [];
  public visibleServices: ServiceDto[] = [];

  public searchTerm = '';
  public selectedCategory = CUSTOMER_ALL_CATEGORY;

  public isLoadingDashboard = true;

  public totalServices = 0;
  public uniqueProviders = 0;
  public condoCity = 'Nao definido';

  public readonly categories = CUSTOMER_CATEGORIES;

  private static readonly DIACRITICS_RE = new RegExp(
    '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
    'g',
  );

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoadingDashboard = true;

    forkJoin({
      profile: this.userApi
        .getMe()
        .pipe(catchError(() => of(null as AppUserProfileDto | null))),

      services: this.serviceApi
        .findAll()
        .pipe(catchError(() => of([] as ServiceDto[]))),
    })
      .pipe(
        finalize(() => {
          this.isLoadingDashboard = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ profile, services }) => {
        this.condoCity = profile?.condominium?.name || 'Nao definido';

        this.services = Array.isArray(services) ? services : [];

        this.syncServiceView();
      });
  }

  private syncServiceView(): void {
    const search = this.normalize(this.searchTerm);
    const category = this.selectedCategory || CUSTOMER_ALL_CATEGORY;

    this.totalServices = this.services.length;

    this.uniqueProviders = new Set(
      this.services
        .map((service) => service.providerId)
        .filter(Boolean),
    ).size;

    this.visibleServices = this.services.filter((service) => {
      const matchesCategory =
        category === CUSTOMER_ALL_CATEGORY || service.category === category;

      const matchesSearch =
        !search ||
        this.normalize(service.name).includes(search) ||
        this.normalize(service.description).includes(search) ||
        this.normalize(service.category).includes(search);

      return matchesCategory && matchesSearch;
    });
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '')
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(CustomerDashboardComponent.DIACRITICS_RE, '')
      .trim();
  }

  public onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.syncServiceView();
  }

  public selectCategory(category: string): void {
    this.selectedCategory = category;
    this.syncServiceView();
  }

  public openServiceDetails(service: ServiceDto): void {
    const dialogRef = this.dialog.open<
      CustomerServiceDetailsDialog,
      CustomerServiceDetailsDialogData,
      CustomerServiceDetailsDialogResult | undefined
    >(CustomerServiceDetailsDialog, {
      data: { service },
      width: '720px',
      maxWidth: '100vw',
      panelClass: 'responsive-dialog',
      autoFocus: false,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }

        if (result.type === 'appointmentCreated') {
          if (result.service) {
            this.replaceService(result.service);
          }

          this.snackBar.success(
            'Agendamento solicitado com sucesso. Acompanhe pela aba Agendamentos.',
          );

          return;
        }

        if (result.type === 'serviceUpdated') {
          this.replaceService(result.service);
        }
      });
  }

  public contactWhatsApp(service: ServiceDto): void {
    this.serviceApi
      .trackMetric(service.id, 'interests')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    const phone = service.contact.replace(/\D/g, '');

    const message = encodeURIComponent(
      `Ola! Vi seu servico "${service.name}" no mural do condominio e gostaria de mais informacoes.`,
    );

    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  }

  public replaceService(updatedService: ServiceDto): void {
    this.services = this.services.map((service) =>
      service.id === updatedService.id ? updatedService : service,
    );

    this.syncServiceView();
  }
}
