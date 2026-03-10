import { Module, Provider, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NextModule } from './modules/next/next.module';
import { RedisModule, RedisService } from './modules/redis';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { TokenBlacklistInterceptor } from './modules/auth/token-blacklist.interceptor';
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
const env = process.env.NODE_ENV || 'development';
const configFile = `app.config.${env}.yaml`;
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
    useFactory: (redisService: RedisService) => {
      return new TokenBlacklistInterceptor(redisService);
    },
    inject: [RedisService],
  },
];

@Module({
  imports: [
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
    NextModule,
  ],
  providers: globalProviders,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, ThrottleMiddleware)
      .forRoutes('*');
  }
}
