import {
  escapeHtml,
  stripHtmlTags,
  removeDangerousAttributes,
  sanitizeInput,
  sanitizeObject,
} from './sanitize.util';

describe('sanitize.util', () => {
  // ─── escapeHtml ──────────────────────────────────────────────────────────────
  describe('escapeHtml', () => {
    it('should escape & to &amp;', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });
    it('should escape < and >', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });
    it('should escape double quotes', () => {
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    });
    it('should escape single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#x27;s');
    });
    it('should escape forward slash', () => {
      expect(escapeHtml('a/b')).toBe('a&#x2F;b');
    });
    it('should escape backtick', () => {
      expect(escapeHtml('`code`')).toBe('&#x60;code&#x60;');
    });
    it('should escape equals sign', () => {
      expect(escapeHtml('a=b')).toBe('a&#x3D;b');
    });
    it('should return empty string for falsy input', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null as any)).toBe('');
    });
    it('should handle XSS payload', () => {
      const xss = '<script>alert("XSS")</script>';
      const result = escapeHtml(xss);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  // ─── stripHtmlTags ───────────────────────────────────────────────────────────
  describe('stripHtmlTags', () => {
    it('should remove simple HTML tags', () => {
      expect(stripHtmlTags('<b>bold</b>')).toBe('bold');
    });
    it('should remove self-closing tags', () => {
      expect(stripHtmlTags('line1<br/>line2')).toBe('line1line2');
    });
    it('should remove nested tags', () => {
      expect(stripHtmlTags('<div><p>text</p></div>')).toBe('text');
    });
    it('should return empty string for empty input', () => {
      expect(stripHtmlTags('')).toBe('');
    });
    it('should handle XSS via img onerror', () => {
      const xss = '<img src=x onerror=alert(1)>';
      const result = stripHtmlTags(xss);
      expect(result).not.toContain('<img');
    });
  });

  // ─── removeDangerousAttributes ───────────────────────────────────────────────
  describe('removeDangerousAttributes', () => {
    it('should remove onclick attribute', () => {
      const input = '<div onclick="evil()">text</div>';
      expect(removeDangerousAttributes(input)).not.toContain('onclick');
    });
    it('should remove onerror attribute', () => {
      const input = '<img onerror="alert(1)">';
      expect(removeDangerousAttributes(input)).not.toContain('onerror');
    });
    it('should not modify clean strings', () => {
      expect(removeDangerousAttributes('clean text')).toBe('clean text');
    });
  });

  // ─── sanitizeInput ───────────────────────────────────────────────────────────
  describe('sanitizeInput', () => {
    it('should strip tags and escape by default', () => {
      const result = sanitizeInput('<b>Hello & World</b>');
      expect(result).toBe('Hello &amp; World');
    });

    it('should respect maxLength option', () => {
      const result = sanitizeInput('Hello World', { maxLength: 5 });
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should return empty string for null/undefined', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should not strip tags when stripTags=false', () => {
      const result = sanitizeInput('<b>bold</b>', {
        stripTags: false,
        escapeHtml: false,
      });
      expect(result).toContain('<b>');
    });

    it('should handle SQL injection attempt in string form', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const result = sanitizeInput(sqlInjection);
      // Should escape the quote
      expect(result).toContain('&#x27;');
    });
  });

  // ─── sanitizeObject ──────────────────────────────────────────────────────────
  describe('sanitizeObject', () => {
    it('should sanitize all string fields', () => {
      const obj = { name: '<script>alert(1)</script>', age: 25 };
      const result = sanitizeObject(obj);
      expect(result.name).not.toContain('<script>');
      expect(result.age).toBe(25);
    });

    it('should skip excluded fields', () => {
      const obj = { name: '<b>bold</b>', password: '<raw>' };
      const result = sanitizeObject(obj, { excludeFields: ['password'] });
      expect(result.name).not.toContain('<b>');
      expect(result.password).toBe('<raw>');
    });

    it('should recursively sanitize nested objects', () => {
      const obj = { user: { name: '<script>xss</script>' } };
      const result = sanitizeObject(obj);
      expect(result.user.name).not.toContain('<script>');
    });

    it('should not modify non-string, non-object values', () => {
      const obj = { count: 42, active: true, data: null };
      const result = sanitizeObject(obj);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle empty object', () => {
      expect(sanitizeObject({})).toEqual({});
    });
  });
});
