import { CategoryLabelPipe } from './category-label.pipe';

describe('CategoryLabelPipe', () => {
  let pipe: CategoryLabelPipe;

  beforeEach(() => {
    pipe = new CategoryLabelPipe();
  });

  it('deve retornar chave i18n para categoria conhecida', () => {
    expect(pipe.transform('CLEANING')).toMatch(/^CATEGORY\./);
  });

  it('deve retornar chave i18n para todas as categorias do sistema', () => {
    const categories = ['CLEANING', 'MAINTENANCE', 'BEAUTY', 'TUTORING', 'TECHNOLOGY', 'PETS', 'HEALTH', 'OTHERS'];
    categories.forEach((cat) => {
      const result = pipe.transform(cat);
      expect(result).toMatch(/^CATEGORY\./);
    });
  });

  it('deve retornar o próprio valor para categoria desconhecida (dado legado)', () => {
    const unknown = 'CATEGORIA_INEXISTENTE';
    expect(pipe.transform(unknown)).toBe(unknown);
  });

  it('deve retornar CATEGORY.OTHERS para null', () => {
    expect(pipe.transform(null as any)).toBe('CATEGORY.OTHERS');
  });

  it('deve retornar CATEGORY.OTHERS para undefined', () => {
    expect(pipe.transform(undefined as any)).toBe('CATEGORY.OTHERS');
  });
});
