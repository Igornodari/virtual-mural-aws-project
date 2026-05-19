import { CanPayAppointmentPipe } from './can-pay-appointment.pipe';
import { AppointmentDto } from 'src/app/core/services/appointment-api.service';

describe('CanPayAppointmentPipe', () => {
  let pipe: CanPayAppointmentPipe;

  beforeEach(() => {
    pipe = new CanPayAppointmentPipe();
  });

  it('deve retornar false para null', () => {
    expect(pipe.transform(null)).toBe(false);
  });

  it('deve retornar false para undefined', () => {
    expect(pipe.transform(undefined)).toBe(false);
  });

  it('deve retornar true para status awaiting_payment', () => {
    const appt = { status: 'awaiting_payment' } as AppointmentDto;
    expect(pipe.transform(appt)).toBe(true);
  });

  it.each(['pending', 'confirmed', 'paid', 'completed', 'cancelled'] as const)(
    'deve retornar false para status "%s"',
    (status) => {
      const appt = { status } as AppointmentDto;
      expect(pipe.transform(appt)).toBe(false);
    },
  );
});
