export const CUSTOMER_ALL_CATEGORY = 'Todas';

export const CUSTOMER_CATEGORIES = [
  CUSTOMER_ALL_CATEGORY,
  'Beleza e Estetica',
  'Manutencao e Reparos',
  'Alimentacao',
  'Aulas e Tutoria',
  'Pets',
  'Limpeza',
  'Tecnologia',
  'Saude e Bem-estar',
  'Outros',
] as const;

export const CUSTOMER_STARS = [1, 2, 3, 4, 5] as const;

export const RATING_LABELS: Record<number, string> = {
  1: 'Pessimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};

export const WEEKDAY_INDEX_BY_LABEL: Record<string, number> = {
  Domingo: 0,
  'Segunda-feira': 1,
  Segunda: 1,
  Terca: 2,
  'Terca-feira': 2,
  'Ter\u00e7a-feira': 2,
  'Ter\u00c3\u00a7a-feira': 2,
  Quarta: 3,
  'Quarta-feira': 3,
  Quinta: 4,
  'Quinta-feira': 4,
  Sexta: 5,
  'Sexta-feira': 5,
  Sabado: 6,
  'S\u00e1bado': 6,
  'S\u00c3\u00a1bado': 6,
};
