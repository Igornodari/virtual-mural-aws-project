import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

export interface TimeBlockDto {
  id: string;
  providerId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
}

export interface CreateTimeBlockPayload {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduleApiService {
  private readonly request = inject(RequestService);

  getBlocks(date?: string): Observable<TimeBlockDto[]> {
    return this.request.get<TimeBlockDto[]>('/schedule/blocks', {
      params: date ? { date } : {},
    });
  }

  createBlock(payload: CreateTimeBlockPayload): Observable<TimeBlockDto> {
    return this.request.post<TimeBlockDto, CreateTimeBlockPayload>(
      '/schedule/blocks',
      payload,
    );
  }

  removeBlock(id: string): Observable<void> {
    return this.request.deletePath<void>(`/schedule/blocks/${id}`);
  }
}
