import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';

/**
 * 全局验证管道配置
 */
export const validationConfig: ValidationPipeOptions = {
  // 自动转换负载为 DTO 实例
  transform: true,
  // 转换时排除没有装饰器的属性
  transformOptions: {
    enableImplicitConversion: true,
  },
  // 白名单模式：过滤掉没有装饰器的属性
  whitelist: true,
  // 如果有非白名单属性则抛出错误
  forbidNonWhitelisted: false,
  // 跳过缺失属性的验证
  skipMissingProperties: false,
  // 跳过 null 值的验证
  skipNullProperties: false,
  // 跳过 undefined 值的验证
  skipUndefinedProperties: false,
  // 禁用详细错误信息 (生产环境建议关闭)
  disableErrorMessages: process.env.NODE_ENV === 'production',
  // 自定义错误消息工厂（返回 HttpException 实例，符合 NestJS 规范）
  exceptionFactory: (errors) => {
    const messages = errors.map((error) => ({
      property: error.property,
      constraints: error.constraints,
      children: error.children,
    }));
    return new BadRequestException({
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      details: messages,
    });
  },
};
