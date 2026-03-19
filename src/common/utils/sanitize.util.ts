/**
 * XSS 防护工具
 * 用于清理用户输入，防止 XSS 攻击
 */

/**
 * HTML 实体编码映射
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * 转义 HTML 特殊字符
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * 移除 HTML 标签
 * @param str 要处理的字符串
 * @returns 移除 HTML 标签后的字符串
 */
export function stripHtmlTags(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  // 移除所有 HTML 标签
  return str.replace(/<[^>]*>/g, '');
}

/**
 * 移除危险的 HTML 属性
 * @param str 要处理的字符串
 * @returns 处理后的字符串
 */
export function removeDangerousAttributes(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  // 移除 on* 事件处理器
  return str.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
}

/**
 * 清理用户输入，防止 XSS 攻击
 * @param input 用户输入
 * @param options 选项
 * @returns 清理后的字符串
 */
export function sanitizeInput(
  input: string,
  options: {
    escapeHtml?: boolean; // 是否转义 HTML，默认 true
    stripTags?: boolean; // 是否移除 HTML 标签，默认 true
    maxLength?: number; // 最大长度，默认不限制
  } = {},
): string {
  const { escapeHtml: shouldEscape = true, stripTags = true, maxLength } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  let result = input.trim();

  // 移除 HTML 标签
  if (stripTags) {
    result = stripHtmlTags(result);
  }

  // 转义 HTML
  if (shouldEscape) {
    result = escapeHtml(result);
  }

  // 限制长度
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  return result;
}

/**
 * 清理对象中的所有字符串属性
 * @param obj 要清理的对象
 * @param options 清理选项
 * @returns 清理后的对象
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: {
    escapeHtml?: boolean;
    stripTags?: boolean;
    maxLength?: number;
    excludeFields?: string[]; // 排除的字段
  } = {},
): T {
  const { excludeFields = [], ...sanitizeOptions } = options;

  const result: Record<string, any> = { ...obj };

  for (const key of Object.keys(result)) {
    if (excludeFields.includes(key)) {
      continue;
    }

    const value = result[key];

    if (typeof value === 'string') {
      result[key] = sanitizeInput(value, sanitizeOptions);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value, options);
    }
  }

  return result as T;
}
