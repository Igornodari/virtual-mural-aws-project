/**
 * Lista canônica de categorias de serviço.
 *
 * O `value` é a string que o backend grava na coluna `services.category`
 * (mantida em PT-BR para compatibilidade com dados existentes).
 * O `i18nKey` é a chave usada para exibir o rótulo traduzido na UI.
 *
 * IMPORTANTE: provider e customer DEVEM usar a mesma lista (esta).
 * Antes existia uma divergência entre `provider.types.ts` (com acentos /
 * nomes curtos) e `customer.constants.ts` (sem acentos / nomes longos),
 * e por isso o filtro do customer nunca encontrava os serviços do provider.
 */
export interface CategoryOption {
  readonly value: string;
  readonly i18nKey: string;
}

export const SERVICE_CATEGORIES: readonly CategoryOption[] = [
  { value: 'Limpeza', i18nKey: 'CATEGORY.CLEANING' },
  { value: 'Manutenção', i18nKey: 'CATEGORY.MAINTENANCE' },
  { value: 'Beleza', i18nKey: 'CATEGORY.BEAUTY' },
  { value: 'Aulas Particulares', i18nKey: 'CATEGORY.TUTORING' },
  { value: 'Tecnologia', i18nKey: 'CATEGORY.TECHNOLOGY' },
  { value: 'Pets', i18nKey: 'CATEGORY.PETS' },
  { value: 'Saúde', i18nKey: 'CATEGORY.HEALTH' },
  { value: 'Outros', i18nKey: 'CATEGORY.OTHERS' },
] as const;

export const CATEGORY_VALUES: readonly string[] = SERVICE_CATEGORIES.map((c) => c.value);

const CATEGORY_I18N_BY_VALUE: Record<string, string> = SERVICE_CATEGORIES.reduce(
  (acc, c) => {
    acc[c.value] = c.i18nKey;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Retorna a chave de tradução para um valor de categoria.
 * Caso o valor não corresponda a nenhuma categoria conhecida (ex.: dado
 * legado), devolve o próprio valor para que ainda seja renderizado.
 */
export function getCategoryI18nKey(value: string | null | undefined): string {
  if (!value) return 'CATEGORY.OTHERS';
  return CATEGORY_I18N_BY_VALUE[value] ?? value;
}
