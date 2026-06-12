import { FilterPipe } from './filter.pipe';

describe('FilterPipe', () => {
  let pipe: FilterPipe;

  beforeEach(() => {
    pipe = new FilterPipe();
  });

  const items = [
    { displayName: 'Ana Silva', category: 'hair' },
    { displayName: 'Carlos Souza', category: 'nails' },
    { displayName: 'Maria Costa', category: 'hair' },
  ];

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty array for null items', () => {
    expect(pipe.transform(null, 'test')).toEqual([]);
  });

  it('should return empty array for undefined items', () => {
    expect(pipe.transform(undefined, 'test')).toEqual([]);
  });

  it('should return empty array for empty array', () => {
    expect(pipe.transform([], 'test')).toEqual([]);
  });

  it('should return all items when searchText is null', () => {
    expect(pipe.transform(items, null)).toEqual(items);
  });

  it('should return all items when searchText is empty', () => {
    expect(pipe.transform(items, '')).toEqual(items);
  });

  it('should return all items when searchText is only whitespace', () => {
    expect(pipe.transform(items, '   ')).toEqual(items);
  });

  it('should filter by the default displayName field', () => {
    const result = pipe.transform(items, 'Ana');
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('Ana Silva');
  });

  it('should be case insensitive', () => {
    const result = pipe.transform(items, 'ana');
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('Ana Silva');
  });

  it('should match partial strings', () => {
    const result = pipe.transform(items, 'Souza');
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('Carlos Souza');
  });

  it('should filter by a custom single field', () => {
    const result = pipe.transform(items, 'hair', 'category');
    expect(result).toHaveLength(2);
  });

  it('should filter by multiple fields', () => {
    const result = pipe.transform(items, 'hair', ['displayName', 'category']);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no items match', () => {
    expect(pipe.transform(items, 'zzz')).toEqual([]);
  });

  it('should handle nested field paths', () => {
    const nestedItems = [
      { user: { name: 'Igor Nodari' } },
      { user: { name: 'Maria Oliveira' } },
    ];
    const result = pipe.transform(nestedItems, 'igor', 'user.name');
    expect(result).toHaveLength(1);
    expect(result[0].user.name).toBe('Igor Nodari');
  });

  it('should return a new array (not mutate input)', () => {
    const result = pipe.transform(items, null);
    expect(result).not.toBe(items);
  });
});
