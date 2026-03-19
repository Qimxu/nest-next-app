import {
  Module,
  Provider,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NextModule } from './modules/next/next.module';
import { HealthModule } from './modules/health/health.module';
import { RedisModule, RedisService } from './modules/redis';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { TokenBlacklistInterceptor } from './modules/auth/token-blacklist.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ThrottleMiddleware } from './common/middleware/throttle.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import {
  appConfig,
  dbConfig,
  jwtConfig,
  redisConfig,
  validationSchema,
} from './common/config';

// 加载 YAML 配置
const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';
const configEnv = isTest ? 'development' : nodeEnv;
const configFile = `app.config.${configEnv}.yaml`;
const configPath = join(process.cwd(), 'config', configFile);
let yamlConfig: any = {};
try {
  yamlConfig = load(readFileSync(configPath, 'utf-8')) || {};
} catch (e) {
  console.warn(`Config file not found: ${configPath}`);
}

// 全局 Providers
const globalProviders: Provider[] = [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: TransformInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useFactory: (redisService: RedisService) => {
      return new TokenBlacklistInterceptor(redisService);
    },
    inject: [RedisService],
  },
];

@Module({
  imports: [
    // 静态资源服务
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'static'),
      serveRoot: '/static',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        dbConfig,
        jwtConfig,
        redisConfig,
        () => yamlConfig, // YAML 配置作为补充
      ],
      validationSchema: validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('db.host'),
        port: configService.get('db.port'),
        username: configService.get('db.username'),
        password: configService.get('db.password'),
        database: configService.get('db.database'),
        synchronize: configService.get('db.synchronize'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    HealthModule,
    ...(isTest ? [] : [NextModule]),
  ],
  providers: globalProviders,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 安全中间件应用于所有路由
    consumer.apply(SecurityMiddleware).forRoutes('*');
    // 限流中间件只应用于 API 路由
    consumer.apply(ThrottleMiddleware).forRoutes('auth/*', 'users/*');
  }
}
