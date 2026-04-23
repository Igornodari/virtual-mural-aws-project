import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

/** Avaliação anônima retornada pelo backend — sem dados do autor */
export interface AnonymousReviewDto {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  serviceId: string;
  rating: number;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewApiService {
  private readonly api = inject(RequestService);


  constructor() {}

  /** Envia uma avaliação para um serviço */
  create(payload: CreateReviewPayload): Observable<AnonymousReviewDto> {
    return this.api.post<AnonymousReviewDto>('/reviews', payload);
  }

  /** Lista avaliações anônimas de um serviço */
  findByService(serviceId: string): Observable<AnonymousReviewDto[]> {
    return this.api.get<AnonymousReviewDto[]>(`/reviews/service/${serviceId}`);
  }
}
