import { ArgumentMetadata } from '@nestjs/common';
import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;

  beforeEach(() => {
    pipe = new SanitizePipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should sanitize string body input', () => {
    const meta: ArgumentMetadata = { type: 'body', metatype: String, data: '' };
    const result = pipe.transform('<script>alert(1)</script>', meta);
    expect(result).not.toContain('<script>');
  });

  it('should sanitize object body input', () => {
    const meta: ArgumentMetadata = { type: 'body', metatype: Object, data: '' };
    const result = pipe.transform({ name: '<b>Test</b>' }, meta);
    expect(result.name).not.toContain('<b>');
  });

  it('should not modify query params (type=query)', () => {
    const meta: ArgumentMetadata = {
      type: 'query',
      metatype: String,
      data: '',
    };
    const input = '<script>alert(1)</script>';
    const result = pipe.transform(input, meta);
    expect(result).toBe(input);
  });

  it('should not modify path params (type=param)', () => {
    const meta: ArgumentMetadata = {
      type: 'param',
      metatype: String,
      data: 'id',
    };
    const result = pipe.transform('123', meta);
    expect(result).toBe('123');
  });

  it('should pass through non-string, non-object body values', () => {
    const meta: ArgumentMetadata = { type: 'body', metatype: Number, data: '' };
    expect(pipe.transform(42, meta)).toBe(42);
    expect(pipe.transform(true, meta)).toBe(true);
    expect(pipe.transform(null, meta)).toBeNull();
  });

  it('should use custom options when provided', () => {
    const customPipe = new SanitizePipe({ escapeHtml: false, stripTags: true });
    const meta: ArgumentMetadata = { type: 'body', metatype: String, data: '' };
    const result = customPipe.transform('<b>bold</b>', meta);
    expect(result).toBe('bold');
    expect(result).not.toContain('&lt;');
  });
});
