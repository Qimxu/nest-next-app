import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { corsConfig } from './common/config/security.config';
import { validationConfig } from './common/config/validation.config';
import { setupSwagger } from './common/config/swagger.config';

// 加载配置
const env = process.env.NODE_ENV || 'development';
const configFile = `app.config.${env}.yaml`;
const configPath = join(process.cwd(), 'config', configFile);
const config: any = load(readFileSync(configPath, 'utf-8')) || {};

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || config.app?.port || 3000;

  const app = await NestFactory.create(AppModule, { cors: true });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe(validationConfig));

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
