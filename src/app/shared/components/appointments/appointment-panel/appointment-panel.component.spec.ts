import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AppointmentPanelComponent } from './appointment-panel.component';

describe('AppointmentPanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentPanelComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(AppointmentPanelComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve iniciar com lista de agendamentos vazia', () => {
    const fixture = TestBed.createComponent(AppointmentPanelComponent);
    const comp = fixture.componentInstance;
    expect(comp.appointments).toEqual([]);
  });

  it('deve ter isLoading=false por padrão', () => {
    const fixture = TestBed.createComponent(AppointmentPanelComponent);
    const comp = fixture.componentInstance;
    expect(comp.isLoading).toBe(false);
  });
});
