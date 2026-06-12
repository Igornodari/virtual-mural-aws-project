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

/**
 * Gera horários de INÍCIO entre `startTime` e `endTime` (inclusivo) com passo
 * de `stepMinutes` (duração + pausa do serviço). Mesma semântica do backend
 * (`generateSteppedSlots`) — o horário final conta como possível início.
 * Ex.: ('09:00','18:00', 180) -> 09:00, 12:00, 15:00, 18:00.
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  stepMinutes = 60,
): string[] {
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

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start > end ||
    stepMinutes < 1
  ) {
    return [];
  }

  const slots: string[] = [];
  for (let current = start; current <= end; current += stepMinutes) {
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
