import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

/**
 * Swagger API 文档配置
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('NestJS + Next.js API')
  .setDescription('API documentation for NestJS + Next.js integrated application')
  .setVersion('1.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('users', 'User management endpoints')
  .addBearerAuth()
  .build();

/**
 * 设置 Swagger 文档
 */
export function setupSwagger(app: INestApplication) {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'NestNext API Docs',
  });
}
