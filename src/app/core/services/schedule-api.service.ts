import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

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
  constructor(private readonly api: MuralApiService) {}

  getBlocks(date?: string): Observable<TimeBlockDto[]> {
    const params: Record<string, string | boolean> | undefined = date
      ? { date }
      : undefined;

    return this.api.get<TimeBlockDto[]>('/schedule/blocks', params);
  }

  createBlock(payload: CreateTimeBlockPayload): Observable<TimeBlockDto> {
    return this.api.post<TimeBlockDto>('/schedule/blocks', payload);
  }

  removeBlock(id: string): Observable<void> {
    return this.api.delete<void>(`/schedule/blocks/${id}`);
  }
}
