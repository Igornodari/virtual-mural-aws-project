import { getNestedValue } from './object-path.util';

describe('getNestedValue', () => {
  it('should return value for a simple key', () => {
    expect(getNestedValue({ name: 'Igor' }, 'name', null)).toBe('Igor');
  });

  it('should return value for a nested path', () => {
    const source = { user: { profile: { name: 'Igor' } } };
    expect(getNestedValue(source, 'user.profile.name', null)).toBe('Igor');
  });

  it('should return defaultValue when the path does not exist', () => {
    expect(getNestedValue({ name: 'Igor' }, 'age', 'default')).toBe('default');
  });

  it('should return defaultValue when source is null', () => {
    expect(getNestedValue(null, 'name', 'default')).toBe('default');
  });

  it('should return defaultValue when source is undefined', () => {
    expect(getNestedValue(undefined, 'name', 'default')).toBe('default');
  });

  it('should return defaultValue when path is empty', () => {
    expect(getNestedValue({ name: 'Igor' }, '', 'default')).toBe('default');
  });

  it('should return defaultValue when an intermediate segment is null', () => {
    expect(getNestedValue({ user: null }, 'user.name', 'fallback')).toBe('fallback');
  });

  it('should return defaultValue when value is undefined', () => {
    expect(getNestedValue({ name: undefined }, 'name', 'fallback')).toBe('fallback');
  });

  it('should work with deeply nested paths', () => {
    const source = { a: { b: { c: { d: 42 } } } };
    expect(getNestedValue(source, 'a.b.c.d', 0)).toBe(42);
  });

  it('should return 0 (not default) because ?? only triggers on null/undefined', () => {
    expect(getNestedValue({ count: 0 }, 'count', -1)).toBe(0);
  });

  it('should return empty string (not default) because ?? only triggers on null/undefined', () => {
    expect(getNestedValue({ label: '' }, 'label', 'fallback')).toBe('');
  });

  it('should return an object value from a nested path', () => {
    const nested = { id: 1, label: 'test' };
    const source = { data: nested };
    expect(getNestedValue(source, 'data', null)).toEqual(nested);
  });
});
