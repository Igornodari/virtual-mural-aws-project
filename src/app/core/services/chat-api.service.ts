import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

export interface ChatMessageDto {
  id: string;
  appointmentId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface SendMessagePayload {
  appointmentId: string;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly api = inject(RequestService);


  constructor() {}

  getMessages(appointmentId: string): Observable<ChatMessageDto[]> {
    return this.api.get<ChatMessageDto[]>(`/chat/${appointmentId}`);
  }

  sendMessage(payload: SendMessagePayload): Observable<ChatMessageDto> {
    return this.api.post<ChatMessageDto>('/chat', payload);
  }
}
