import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { sanitizeInput, sanitizeObject } from '../utils/sanitize.util';

/**
 * XSS 清理管道配置选项
 */
interface SanitizePipeOptions {
  /** 是否转义 HTML，默认 true */
  escapeHtml?: boolean;
  /** 是否移除 HTML 标签，默认 true */
  stripTags?: boolean;
  /** 最大字符串长度，默认不限制 */
  maxLength?: number;
  /** 排除的字段（不进行清理） */
  excludeFields?: string[];
}

/**
 * XSS 清理管道
 * 自动清理请求体中的恶意内容，防止 XSS 攻击
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  private readonly options: SanitizePipeOptions;

  constructor(options: SanitizePipeOptions = {}) {
    this.options = {
      escapeHtml: true,
      stripTags: true,
      ...options,
    };
  }

  transform(value: any, metadata: ArgumentMetadata) {
    // 只处理 body 类型的数据
    if (metadata.type !== 'body') {
      return value;
    }

    // 如果是字符串，直接清理
    if (typeof value === 'string') {
      return sanitizeInput(value, this.options);
    }

    // 如果是对象，递归清理
    if (typeof value === 'object' && value !== null) {
      return sanitizeObject(value, this.options);
    }

    return value;
  }
}
