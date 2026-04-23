import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null as unknown as string)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined as unknown as string)).toBe('');
  });

  it('should return the original string when shorter than the limit', () => {
    expect(pipe.transform('hello', 10)).toBe('hello');
  });

  it('should return the original string when equal to the limit', () => {
    expect(pipe.transform('hello', 5)).toBe('hello');
  });

  it('should truncate and append default ellipsis when longer than the limit', () => {
    expect(pipe.transform('hello world', 5)).toBe('hello...');
  });

  it('should use custom ellipsis', () => {
    expect(pipe.transform('hello world', 5, '---')).toBe('hello---');
  });

  it('should use default limit of 100', () => {
    const exactly100 = 'x'.repeat(100);
    expect(pipe.transform(exactly100)).toBe(exactly100);

    const over100 = 'x'.repeat(101);
    expect(pipe.transform(over100)).toBe('x'.repeat(100) + '...');
  });

  it('should not append ellipsis when text is exactly the limit', () => {
    const text = 'a'.repeat(50);
    const result = pipe.transform(text, 50);
    expect(result).not.toContain('...');
    expect(result).toBe(text);
  });
});
