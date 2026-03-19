import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { TransformInterceptor, LogInterceptor } from './core/interceptors';
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

  const app = await NestFactory.create(AppModule, { cors: true });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe(validationConfig));

  // 全局拦截器（注意顺序：日志 -> 响应转换）
  app.useGlobalInterceptors(new LogInterceptor(), new TransformInterceptor());

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
