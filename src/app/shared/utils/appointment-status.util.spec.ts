import {
  BLOCKING_APPOINTMENT_STATUSES,
  isBlockingAppointmentStatus,
  canPayAppointment,
  canConfirmAppointment,
  canCancelAppointment,
  canCompleteAppointment,
} from './appointment-status.util';
import { AppointmentDto, AppointmentStatus } from 'src/app/core/services/appointment-api.service';

function makeAppointment(status: AppointmentStatus): AppointmentDto {
  return {
    id: 'appt1',
    serviceId: 'svc1',
    customerId: 'cust1',
    scheduledDate: '2024-01-15',
    scheduledDay: 'monday',
    status,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

describe('appointment-status.util', () => {
  describe('BLOCKING_APPOINTMENT_STATUSES', () => {
    it('should contain confirmed, awaiting_payment, paid and completed', () => {
      expect(BLOCKING_APPOINTMENT_STATUSES).toContain('confirmed');
      expect(BLOCKING_APPOINTMENT_STATUSES).toContain('awaiting_payment');
      expect(BLOCKING_APPOINTMENT_STATUSES).toContain('paid');
      expect(BLOCKING_APPOINTMENT_STATUSES).toContain('completed');
    });

    it('should not contain pending or cancelled', () => {
      expect(BLOCKING_APPOINTMENT_STATUSES).not.toContain('pending');
      expect(BLOCKING_APPOINTMENT_STATUSES).not.toContain('cancelled');
    });
  });

  describe('isBlockingAppointmentStatus', () => {
    it.each(['confirmed', 'awaiting_payment', 'paid', 'completed'] as AppointmentStatus[])(
      'should return true for %s',
      (status) => {
        expect(isBlockingAppointmentStatus(status)).toBe(true);
      },
    );

    it.each(['pending', 'cancelled'] as AppointmentStatus[])(
      'should return false for %s',
      (status) => {
        expect(isBlockingAppointmentStatus(status)).toBe(false);
      },
    );
  });

  describe('canPayAppointment', () => {
    it('should return true when status is confirmed', () => {
      expect(canPayAppointment(makeAppointment('confirmed'))).toBe(true);
    });

    it('should return true when status is awaiting_payment', () => {
      expect(canPayAppointment(makeAppointment('awaiting_payment'))).toBe(true);
    });

    it.each(['pending', 'paid', 'cancelled', 'completed'] as AppointmentStatus[])(
      'should return false for %s',
      (status) => {
        expect(canPayAppointment(makeAppointment(status))).toBe(false);
      },
    );

    it('should return false for null', () => {
      expect(canPayAppointment(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(canPayAppointment(undefined)).toBe(false);
    });
  });

  describe('canConfirmAppointment', () => {
    it('should return true when status is pending', () => {
      expect(canConfirmAppointment(makeAppointment('pending'))).toBe(true);
    });

    it.each(['confirmed', 'awaiting_payment', 'paid', 'cancelled', 'completed'] as AppointmentStatus[])(
      'should return false for %s',
      (status) => {
        expect(canConfirmAppointment(makeAppointment(status))).toBe(false);
      },
    );

    it('should return false for null', () => {
      expect(canConfirmAppointment(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(canConfirmAppointment(undefined)).toBe(false);
    });
  });

  describe('canCancelAppointment', () => {
    it.each(['pending', 'confirmed'] as AppointmentStatus[])(
      'should return true for %s',
      (status) => {
        expect(canCancelAppointment(makeAppointment(status))).toBe(true);
      },
    );

    it.each(['awaiting_payment', 'paid', 'cancelled', 'completed'] as AppointmentStatus[])(
      'should return false for %s',
      (status) => {
        expect(canCancelAppointment(makeAppointment(status))).toBe(false);
      },
    );

    it('should return false for null', () => {
      expect(canCancelAppointment(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(canCancelAppointment(undefined)).toBe(false);
    });
  });

  describe('canCompleteAppointment', () => {
    it('should return true when status is paid', () => {
      expect(canCompleteAppointment(makeAppointment('paid'))).toBe(true);
    });

    it.each(['pending', 'confirmed', 'awaiting_payment', 'cancelled', 'completed'] as AppointmentStatus[])(
      'should return false for %s',
      (status) => {
        expect(canCompleteAppointment(makeAppointment(status))).toBe(false);
      },
    );

    it('should return false for null', () => {
      expect(canCompleteAppointment(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(canCompleteAppointment(undefined)).toBe(false);
    });
  });
});
