import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  price: string;
  contact: string;
  category: string;
  availableDays: string[];
  availabilitySlots?: { day: string; startTime: string; endTime: string }[] | null;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  providerId: string;
  condominiumId: string;
  clicks: number;
  interests: number;
  completions: number;
  abandonments: number;
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAnalyticsDto {
  serviceId: string;
  serviceName: string;
  clicks: number;
  interests: number;
  completions: number;
  abandonments: number;
  rating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  recentComments: { rating: number; comment: string; createdAt: string }[];
}

export interface CreateServicePayload {
  name: string;
  description: string;
  price: string;
  contact: string;
  category: string;
  availableDays: string[];
  availabilitySlots?: { day: string; startTime: string; endTime: string }[];
}

export type UpdateServicePayload = Partial<CreateServicePayload>;
export type TrackMetric = 'clicks' | 'interests' | 'completions' | 'abandonments';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private readonly request = inject(RequestService);

  findAll(): Observable<ServiceDto[]> {
    return this.request.get<ServiceDto[]>('/services');
  }

  findMine(): Observable<ServiceDto[]> {
    return this.request.get<ServiceDto[]>('/services', {
      params: { mine: true },
    });
  }

  findOne(id: string): Observable<ServiceDto> {
    return this.request.get<ServiceDto>(`/services/${id}`);
  }

  getProviderAnalytics(): Observable<ServiceAnalyticsDto[]> {
    return this.request.get<ServiceAnalyticsDto[]>('/services/analytics/me');
  }

  getAnalytics(id: string): Observable<ServiceAnalyticsDto> {
    return this.request.get<ServiceAnalyticsDto>(`/services/${id}/analytics`);
  }

  create(payload: CreateServicePayload): Observable<ServiceDto> {
    return this.request.post<ServiceDto, CreateServicePayload>('/services', payload);
  }

  update(id: string, payload: UpdateServicePayload): Observable<ServiceDto> {
    return this.request.patchPath<ServiceDto, UpdateServicePayload>(
      `/services/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<void> {
    return this.request.deletePath<void>(`/services/${id}`);
  }

  trackMetric(id: string, metric: TrackMetric): Observable<void> {
    return this.request.patchPath<void, Record<string, never>>(
      `/services/${id}/track/${metric}`,
      {},
    );
  }
}
