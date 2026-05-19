import { titleCase } from './string.helper';

describe('titleCase', () => {
  it('deve capitalizar a primeira letra de cada palavra', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });

  it('deve lidar com string já em título', () => {
    expect(titleCase('João Silva')).toBe('João Silva');
  });

  it('deve converter tudo para title case a partir de maiúsculas', () => {
    expect(titleCase('PINTURA RESIDENCIAL')).toBe('Pintura Residencial');
  });

  it('deve retornar string vazia para undefined', () => {
    expect(titleCase(undefined)).toBe('');
  });

  it('deve retornar string vazia para string vazia', () => {
    expect(titleCase('')).toBe('');
  });

  it('deve preservar palavras de um único caractere', () => {
    expect(titleCase('a b c')).toBe('A B C');
  });
});
