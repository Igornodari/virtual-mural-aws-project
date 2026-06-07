import { RatingLabelPipe } from './rating-label.pipe';

describe('RatingLabelPipe', () => {
  let pipe: RatingLabelPipe;

  beforeEach(() => {
    pipe = new RatingLabelPipe();
  });

  it('deve retornar string vazia para null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('deve retornar string vazia para undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('deve retornar string vazia para 0', () => {
    expect(pipe.transform(0)).toBe('');
  });

  it('deve retornar "Pessimo" para rating 1', () => {
    expect(pipe.transform(1)).toBe('Pessimo');
  });

  it('deve retornar "Excelente" para rating 5', () => {
    expect(pipe.transform(5)).toBe('Excelente');
  });

  it('deve retornar "Bom" para rating 4', () => {
    expect(pipe.transform(4)).toBe('Bom');
  });

  it('deve retornar string vazia para rating fora do mapa', () => {
    expect(pipe.transform(9)).toBe('');
  });
});
