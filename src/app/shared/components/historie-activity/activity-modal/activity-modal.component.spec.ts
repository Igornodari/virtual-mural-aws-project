import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ActivityModalComponent } from './activity-modal.component';
import { AuthService } from 'src/app/core/services/auth.service';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('ActivityModalComponent', () => {
  let component: ActivityModalComponent;
  let fixture: ComponentFixture<ActivityModalComponent>;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

  const mockActivityLogs = [
    {
      id: '1',
      action: 'create',
      description: 'Created service',
      createdAt: '2024-01-01',
    },
  ];

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        ActivityModalComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { activityLogs: mockActivityLogs } },
        {
          provide: AuthService,
          useValue: { $user: of(null), $condominium: of(null) },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
        { provide: Router, useValue: { navigateByUrl: vi.fn(), url: '/' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have access to dialog data', () => {
    expect(component.data.activityLogs).toEqual(mockActivityLogs);
  });

  it('should close the dialog when close is called', () => {
    component.dialogRef.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
