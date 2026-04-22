import { AppointmentDto, AppointmentStatus } from 'src/app/core/services/appointment-api.service';

export const BLOCKING_APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'confirmed',
  'awaiting_payment',
  'paid',
  'completed',
];

export function isBlockingAppointmentStatus(status: AppointmentStatus): boolean {
  return BLOCKING_APPOINTMENT_STATUSES.includes(status);
}

export function canPayAppointment(appointment: AppointmentDto | null | undefined): boolean {
  return appointment?.status === 'confirmed' || appointment?.status === 'awaiting_payment';
}

export function canConfirmAppointment(appointment: AppointmentDto | null | undefined): boolean {
  return appointment?.status === 'pending';
}

export function canCancelAppointment(appointment: AppointmentDto | null | undefined): boolean {
  return appointment?.status === 'pending' || appointment?.status === 'confirmed';
}

export function canCompleteAppointment(appointment: AppointmentDto | null | undefined): boolean {
  return appointment?.status === 'paid';
}
