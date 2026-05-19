import { CanCancelAsCustomerPipe } from './can-cancel-as-customer.pipe';
import { AppointmentDto } from 'src/app/core/services/appointment-api.service';

describe('CanCancelAsCustomerPipe', () => {
  let pipe: CanCancelAsCustomerPipe;

  beforeEach(() => {
    pipe = new CanCancelAsCustomerPipe();
  });

  it('deve retornar false para null', () => {
    expect(pipe.transform(null)).toBe(false);
  });

  it('deve retornar false para undefined', () => {
    expect(pipe.transform(undefined)).toBe(false);
  });

  it.each(['pending', 'confirmed', 'awaiting_payment'] as const)(
    'deve retornar true para status "%s"',
    (status) => {
      const appt = { status } as AppointmentDto;
      expect(pipe.transform(appt)).toBe(true);
    },
  );

  it.each(['paid', 'completed', 'cancelled'] as const)(
    'deve retornar false para status "%s"',
    (status) => {
      const appt = { status } as AppointmentDto;
      expect(pipe.transform(appt)).toBe(false);
    },
  );
});
