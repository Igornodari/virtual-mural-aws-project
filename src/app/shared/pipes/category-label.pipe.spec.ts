import { CategoryLabelPipe } from './category-label.pipe';
import { SERVICE_CATEGORIES } from '../constant/categories.constants';

describe('CategoryLabelPipe', () => {
  let pipe: CategoryLabelPipe;

  beforeEach(() => {
    pipe = new CategoryLabelPipe();
  });

  it('deve retornar a chave i18n para um valor de categoria conhecido', () => {
    const cleaning = SERVICE_CATEGORIES[0]; // { value: 'Limpeza', i18nKey: 'CATEGORY.CLEANING' }
    expect(pipe.transform(cleaning.value)).toBe(cleaning.i18nKey);
    expect(pipe.transform(cleaning.value)).toMatch(/^CATEGORY\./);
  });

  it('deve retornar a chave i18n correta para todas as categorias do sistema', () => {
    SERVICE_CATEGORIES.forEach(({ value, i18nKey }) => {
      expect(pipe.transform(value)).toBe(i18nKey);
      expect(pipe.transform(value)).toMatch(/^CATEGORY\./);
    });
  });

  it('deve retornar o próprio valor para categoria desconhecida (dado legado)', () => {
    const unknown = 'CATEGORIA_INEXISTENTE';
    expect(pipe.transform(unknown)).toBe(unknown);
  });

  it('deve retornar CATEGORY.OTHERS para null', () => {
    expect(pipe.transform(null as unknown as string)).toBe('CATEGORY.OTHERS');
  });

  it('deve retornar CATEGORY.OTHERS para undefined', () => {
    expect(pipe.transform(undefined as unknown as string)).toBe('CATEGORY.OTHERS');
  });
});
