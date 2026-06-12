import { DateTime } from './datetime.helper';

describe('DateTime', () => {

  describe('convertToUtc', () => {
    it('deve formatar uma data para yyyy-MM-dd', () => {
      expect(DateTime.convertToUtc('2025-03-15T10:00:00')).toBe('2025-03-15');
    });
  });

  describe('convertToUTCDateFromBr', () => {
    it('deve converter data no formato dd/MM/yyyy para Date UTC', () => {
      const result = DateTime.convertToUTCDateFromBr('25/12/2025');
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(11); // dezembro = 11
      expect(result.getUTCDate()).toBe(25);
    });
  });

  describe('format', () => {
    it('deve formatar uma string ISO', () => {
      expect(DateTime.format('2025-06-01T00:00:00', 'dd/MM/yyyy')).toBe('01/06/2025');
    });

    it('deve formatar um objeto Date', () => {
      const date = new Date('2025-01-15T00:00:00');
      expect(DateTime.format(date, 'yyyy-MM-dd')).toBe('2025-01-15');
    });
  });

  describe('setMinutes', () => {
    it('deve definir hora e minuto corretamente', () => {
      const result = DateTime.setMinutes('2025-06-01', '14:30');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('deve lançar erro para formato inválido de minutos', () => {
      expect(() => DateTime.setMinutes('2025-06-01', '9:0')).toThrow('minute format invalid');
    });
  });

  describe('setStartTimeOfDay', () => {
    it('deve setar hora 00:00:00 no início do dia', () => {
      const result = DateTime.setStartTimeOfDay('2025-06-15');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('setEndTimeOfDay', () => {
    it('deve setar hora 23:59:00 no fim do dia', () => {
      const result = DateTime.setEndTimeOfDay('2025-06-15');
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
    });
  });

  describe('getMinSelectableTime', () => {
    it('deve retornar 08:00 para data que não é hoje', () => {
      expect(DateTime.getMinSelectableTime(new Date('2099-01-01'))).toBe('08:00');
    });

    it('deve retornar 08:00 para valores inválidos', () => {
      expect(DateTime.getMinSelectableTime(null)).toBe('08:00');
      expect(DateTime.getMinSelectableTime('invalido')).toBe('08:00');
    });
  });

  describe('calculateDateDifference', () => {
    it('deve retornar anos', () => {
      const past = new Date();
      past.setFullYear(past.getFullYear() - 2);
      expect(DateTime.calculateDateDifference(past)).toMatch(/anos?/);
    });

    it('deve retornar horas', () => {
      const past = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(DateTime.calculateDateDifference(past)).toMatch(/horas?/);
    });

    it('deve retornar string vazia para diferença negativa', () => {
      const future = new Date(Date.now() + 1000 * 60);
      expect(DateTime.calculateDateDifference(future)).toBe('');
    });

    it('deve retornar "Data inválida" para data inválida', () => {
      expect(DateTime.calculateDateDifference('not-a-date')).toBe('Data inválida');
    });

    it('deve usar endDate quando fornecido', () => {
      expect(DateTime.calculateDateDifference('2025-01-01', '2026-01-01')).toMatch(/ano/);
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('deve retornar o primeiro dia do mês UTC', () => {
      const result = DateTime.getFirstDayOfMonth(new Date('2025-06-15'));
      expect(result.getUTCDate()).toBe(1);
    });
  });

  describe('getLastDayOfMonth', () => {
    it('deve retornar o último dia de junho (30)', () => {
      const result = DateTime.getLastDayOfMonth(new Date('2025-06-01'));
      expect(result.getUTCDate()).toBe(30);
    });

    it('deve retornar o último dia de fevereiro (28 em ano não bissexto)', () => {
      const result = DateTime.getLastDayOfMonth(new Date('2025-02-01'));
      expect(result.getUTCDate()).toBe(28);
    });
  });

  describe('add', () => {
    it('deve adicionar dias', () => {
      const base = new Date(2025, 0, 10);
      const result = DateTime.add(base, { days: 5 });
      expect(result.getDate()).toBe(15);
    });

    it('deve adicionar semanas', () => {
      const base = new Date(2025, 0, 1);
      const result = DateTime.add(base, { weeks: 2 });
      expect(result.getDate()).toBe(15);
    });

    it('deve adicionar meses', () => {
      const base = new Date(2025, 0, 1);
      const result = DateTime.add(base, { months: 3 });
      expect(result.getMonth()).toBe(3); // abril
    });

    it('deve adicionar anos', () => {
      const base = new Date(2025, 0, 1);
      const result = DateTime.add(base, { years: 1 });
      expect(result.getFullYear()).toBe(2026);
    });
  });
});
