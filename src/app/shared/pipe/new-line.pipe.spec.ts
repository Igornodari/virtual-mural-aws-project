import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { BrowserModule } from '@angular/platform-browser';
import { NewLine } from './new-line.pipe';

function rawHtml(safeHtml: unknown): string {
  return (safeHtml as { changingThisBreaksApplicationSecurity: string })
    .changingThisBreaksApplicationSecurity;
}

describe('NewLine', () => {
  let pipe: NewLine;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule],
      providers: [NewLine],
    });

    pipe = TestBed.inject(NewLine);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should replace \\n with <br>', () => {
    const result = rawHtml(pipe.transform('line1\nline2'));
    expect(result).toContain('<br>');
    expect(result).not.toContain('\n');
  });

  it('should replace \\r\\n with <br>', () => {
    const result = rawHtml(pipe.transform('line1\r\nline2'));
    expect(result).toContain('<br>');
    expect(result).not.toContain('\r\n');
  });

  it('should replace multiple newlines', () => {
    const result = rawHtml(pipe.transform('a\nb\nc'));
    const brCount = (result.match(/<br>/g) ?? []).length;
    expect(brCount).toBe(2);
  });

  it('should handle text with no newlines unchanged', () => {
    const result = rawHtml(pipe.transform('no newlines here'));
    expect(result).toContain('no newlines here');
    expect(result).not.toContain('<br>');
  });

  it('should handle empty string', () => {
    const result = rawHtml(pipe.transform(''));
    expect(result).toBe('');
  });

  it('should handle null gracefully', () => {
    const result = rawHtml(pipe.transform(null as unknown as string));
    expect(result).toBe('');
  });

  it('should return a trusted SafeHtml value via DomSanitizer', () => {
    const spy = vi.spyOn(sanitizer, 'bypassSecurityTrustHtml');
    pipe.transform('hello\nworld');
    expect(spy).toHaveBeenCalledWith('hello<br>world');
  });
});
