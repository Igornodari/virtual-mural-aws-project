import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

export interface ReviewDto {
  id: string;
  serviceId: string;
  authorId: string;
  rating: number;
  comment?: string;
  author?: { displayName: string; avatarUrl?: string };
  createdAt: string;
}

export interface CreateReviewPayload {
  serviceId: string;
  rating: number;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewApiService {
  constructor(private readonly api: MuralApiService) {}

  /** Envia uma avaliação para um serviço */
  create(payload: CreateReviewPayload): Observable<ReviewDto> {
    return this.api.post<ReviewDto>('/reviews', payload);
  }

  /** Lista avaliações de um serviço */
  findByService(serviceId: string): Observable<ReviewDto[]> {
    return this.api.get<ReviewDto[]>(`/reviews/service/${serviceId}`);
  }
}
