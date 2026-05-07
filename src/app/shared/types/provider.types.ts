import { CATEGORY_VALUES } from '../constant/categories.constants';

export const WEEKDAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

/**
 * Categorias disponíveis para o provider escolher ao criar um serviço.
 * Reexporta a lista canônica em `shared/constant/categories.constants.ts`
 * — provider e customer DEVEM compartilhar exatamente os mesmos valores
 * (era essa divergência que quebrava o filtro do customer).
 */
export const CATEGORIES = CATEGORY_VALUES;
