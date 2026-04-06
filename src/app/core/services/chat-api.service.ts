import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

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
  constructor(private readonly api: MuralApiService) {}

  getMessages(appointmentId: string): Observable<ChatMessageDto[]> {
    return this.api.get<ChatMessageDto[]>(`/chat/${appointmentId}`);
  }

  sendMessage(payload: SendMessagePayload): Observable<ChatMessageDto> {
    return this.api.post<ChatMessageDto>('/chat', payload);
  }
}
