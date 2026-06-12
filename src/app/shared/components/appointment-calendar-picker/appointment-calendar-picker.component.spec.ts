import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import {
  AppointmentCalendarPickerComponent,
  CalendarSelection,
} from './appointment-calendar-picker.component';
import {
  WEEKDAY_NAME_BY_JS_INDEX,
  formatDateToISO,
} from '../../types/availability.types';

/** Aguarda o flush dos microtasks (queueMicrotask do deferStateChange). */
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Data futura (hoje + N dias) normalizada à meia-noite local. */
function futureDate(daysAhead: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysAhead);
  return d;
}

describe('AppointmentCalendarPickerComponent', () => {
  let component: AppointmentCalendarPickerComponent;
  let fixture: ComponentFixture<AppointmentCalendarPickerComponent>;

  // Dia-alvo a 7 dias no futuro (mesmo dia da semana de hoje, garantidamente futuro).
  const target = futureDate(7);
  const dayName = WEEKDAY_NAME_BY_JS_INDEX[target.getDay()];
  const iso = formatDateToISO(target);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppointmentCalendarPickerComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentCalendarPickerComponent);
    component = fixture.componentInstance;
  });

  describe('dateFilter (disponibilidade do dia)', () => {
    it('bloqueia quando não há janela de atendimento para o dia', () => {
      component.availabilitySlots = [];
      expect(component.dateFilter(target)).toBe(false);
    });

    it('libera dia com janela de atendimento e horários livres', () => {
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '12:00' },
      ];
      component.blockedSlots = [];
      expect(component.dateFilter(target)).toBe(true);
    });

    it('bloqueia o dia inteiro quando há bloqueio de dia (time = null)', () => {
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '12:00' },
      ];
      component.blockedSlots = [{ date: iso, time: null }];
      expect(component.dateFilter(target)).toBe(false);
    });

    it('bloqueia o dia quando TODOS os horários estão confirmados', () => {
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '12:00' }, // grade inclusiva: 09,10,11,12
      ];
      component.blockedSlots = [
        { date: iso, time: '09:00' },
        { date: iso, time: '10:00' },
        { date: iso, time: '11:00' },
        { date: iso, time: '12:00' },
      ];
      expect(component.dateFilter(target)).toBe(false);
    });

    it('mantém o dia disponível quando há ao menos um horário livre', () => {
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '12:00' },
      ];
      component.blockedSlots = [
        { date: iso, time: '09:00' },
        { date: iso, time: '10:00' },
      ];
      expect(component.dateFilter(target)).toBe(true);
    });

    it('bloqueia datas no passado / hoje', () => {
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '12:00' },
      ];
      const today = futureDate(0);
      expect(component.dateFilter(today)).toBe(false);
    });
  });

  describe('carga inicial sem navegação (bug raiz)', () => {
    it('reatribui dateFilter (nova referência) quando a disponibilidade chega', async () => {
      const before = component.dateFilter;
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '18:00' },
      ];

      component.ngOnChanges({
        availabilitySlots: new SimpleChange(
          [],
          component.availabilitySlots,
          false,
        ),
      });
      await flush();

      // Nova referência => mat-calendar re-avalia o filtro no 1º load.
      expect(component.dateFilter).not.toBe(before);
    });

    it('também atualiza quando apenas blockedSlots muda (async)', async () => {
      const before = component.dateFilter;
      component.blockedSlots = [{ date: iso, time: '09:00' }];

      component.ngOnChanges({
        blockedSlots: new SimpleChange([], component.blockedSlots, false),
      });
      await flush();

      expect(component.dateFilter).not.toBe(before);
    });
  });

  describe('horários ao selecionar um dia', () => {
    it('exclui horários confirmados (grade inclusiva, passo 60)', async () => {
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '12:00' }, // 09,10,11,12
      ];
      component.blockedSlots = [{ date: iso, time: '10:00' }];

      component.onDateSelected(target);
      await flush();

      expect(component.timeSlots).toEqual(['09:00', '11:00', '12:00']);
    });

    it('gera a grade pelo passo (stepMinutes 180 → 09/12/15/18)', async () => {
      component.stepMinutes = 180;
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '18:00' },
      ];
      component.blockedSlots = [];

      component.onDateSelected(target);
      await flush();

      expect(component.timeSlots).toEqual(['09:00', '12:00', '15:00', '18:00']);
    });

    it('emite selectionChange com date/day/time ao escolher um horário', async () => {
      component.availabilitySlots = [
        { day: dayName, startTime: '09:00', endTime: '12:00' },
      ];
      component.blockedSlots = [];

      const emitted: CalendarSelection[] = [];
      component.selectionChange.subscribe((s) => emitted.push(s));

      component.onDateSelected(target);
      await flush();
      component.selectTime('09:00');
      await flush();

      expect(emitted).toEqual([{ date: iso, day: dayName, time: '09:00' }]);
    });
  });
});
