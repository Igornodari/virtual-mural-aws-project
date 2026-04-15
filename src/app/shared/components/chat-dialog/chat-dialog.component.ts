import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { ChatApiService, ChatMessageDto } from 'src/app/core/services/chat-api.service';
import { AuthService } from 'src/app/core/services/auth.service';

export interface ChatDialogData {
  appointmentId: string;
  recipientName: string;
}

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit {
  private readonly chatApi = inject(ChatApiService);
  private readonly authService = inject(AuthService);
  
  readonly messages = signal<ChatMessageDto[]>([]);
  readonly isLoading = signal(false);
  readonly isSending = signal(false);
  readonly newMessage = signal('');
  
  currentUserId = '';

  constructor(
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChatDialogData
  ) {
    this.currentUserId = this.authService.currentUser?.id || '';
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.isLoading.set(true);
    this.chatApi.getMessages(this.data.appointmentId).pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        this.scrollToBottom();
      },
    });
  }

  onSendMessage(): void {
    const content = this.newMessage().trim();
    if (!content || this.isSending()) return;

    this.isSending.set(true);
    this.chatApi.sendMessage({
      appointmentId: this.data.appointmentId,
      content
    }).pipe(
      finalize(() => this.isSending.set(false)),
    ).subscribe({
      next: (msg) => {
        this.messages.update(prev => [...prev, msg]);
        this.newMessage.set('');
        this.scrollToBottom();
      },
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
