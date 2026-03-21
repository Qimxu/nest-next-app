import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { LogInterceptor } from './core/interceptors';
import { SanitizePipe } from './core/pipes';
import {
  corsConfig,
  loadYamlConfig,
  setupSwagger,
  validationConfig,
} from './core/config';

const yamlConfig = loadYamlConfig(process.env.NODE_ENV, { silent: true });

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || yamlConfig.app?.port || 3000;

  const app = await NestFactory.create(AppModule);

  // 全局管道：先 XSS 清理，再验证（密码字段排除在外，避免哈希前被转义）
  app.useGlobalPipes(
    new SanitizePipe({ excludeFields: ['password', 'newPassword', 'token'] }),
    new ValidationPipe(validationConfig),
  );

  // 全局日志拦截器（TransformInterceptor 已在 app.module.ts 通过 APP_INTERCEPTOR 注册）
  app.useGlobalInterceptors(new LogInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS 配置
  app.enableCors(corsConfig);

  // Swagger API 文档
  setupSwagger(app);

  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap();
