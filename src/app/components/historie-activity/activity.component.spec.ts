import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { ActivityComponent } from './activity.component';
import { MatDialog } from '@angular/material/dialog';
import { RequestService } from '../../core/services/request.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
  let requestServiceSpy: { getActivities: ReturnType<typeof vi.fn> };
  let dialogSpy: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    requestServiceSpy = { getActivities: vi.fn().mockReturnValue(of([])) };
    dialogSpy = { open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }) };

    await TestBed.configureTestingModule({
      imports: [
        ActivityComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeLoader } }),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RequestService, useValue: requestServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    component.table = 'services';
    component.id = 'svc1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getActivities when fetchActivities is called', () => {
    component.fetchActivities();
    expect(requestServiceSpy.getActivities).toHaveBeenCalledWith('services', 'svc1');
  });

  it('should call fetchActivities when openActivityModal is called', () => {
    const fetchSpy = vi.spyOn(component, 'fetchActivities').mockImplementation(() => {
      component.activityLogs$ = EMPTY;
    });
    component.openActivityModal();
    expect(fetchSpy).toHaveBeenCalled();
  });
});
