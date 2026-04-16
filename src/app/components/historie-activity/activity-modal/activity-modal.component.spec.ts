import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivityModalComponent } from './activity-modal.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

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
    { id: '1', action: 'create', description: 'Created service', createdAt: '2024-01-01' },
  ];

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        ActivityModalComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeLoader } }),
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { activityLogs: mockActivityLogs } },
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
