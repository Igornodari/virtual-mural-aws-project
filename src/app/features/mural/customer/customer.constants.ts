import { CATEGORY_VALUES } from 'src/app/shared/constant/categories.constants';

/**
 * Sentinel usado pelo chip "Todas" no filtro do customer.
 * Mantido em PT porque não é persistido — só compara igualdade local.
 * O rótulo exibido é traduzido via i18n (`MURAL.CUSTOMER.FILTER_ALL`).
 */
export const CUSTOMER_ALL_CATEGORY = '__ALL__';

/**
 * Lista de categorias usadas como filtro no customer dashboard.
 * IMPORTANTE: deve usar EXATAMENTE os mesmos valores que o provider
 * grava no backend. Antes existiam duas listas divergentes que faziam
 * o filtro nunca achar nenhum serviço.
 */
export const CUSTOMER_CATEGORIES: readonly string[] = [
  CUSTOMER_ALL_CATEGORY,
  ...CATEGORY_VALUES,
];

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
