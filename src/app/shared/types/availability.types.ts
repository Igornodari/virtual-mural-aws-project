export interface AvailabilitySlot {
  /** Nome do dia da semana em português (ex: 'Segunda-feira') */
  day: string;
  /** Horário de início no formato HH:mm (ex: '09:00') */
  startTime: string;
  /** Horário de término no formato HH:mm (ex: '18:00') */
  endTime: string;
}

/** Mapa de índice JS (0=Dom) para nome em PT-BR */
export const WEEKDAY_NAME_BY_JS_INDEX: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

/** Gera time slots em incrementos de 60 min entre startTime e endTime */
export function generateTimeSlots(startTime: string, endTime: string): string[] {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTimeString = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const slots: string[] = [];

  for (let current = start; current < end; current += 60) {
    slots.push(toTimeString(current));
  }

  return slots;
}

/** Formata uma data JS para 'YYYY-MM-DD' */
export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
