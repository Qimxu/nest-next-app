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
import { join } from 'path';
import { getAppModules } from './modules';
import { RedisService } from './modules/redis';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { TokenBlacklistInterceptor } from './modules/auth/token-blacklist.interceptor';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { ThrottleInterceptor } from './core/interceptors/throttle.interceptor';
import { applyAppMiddlewares } from './middlewares';
import {
  appConfig,
  dbConfig,
  jwtConfig,
  redisConfig,
  loadYamlConfig,
  validationSchema,
} from './core/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';
const yamlConfig = loadYamlConfig(nodeEnv);

// 全局 Providers
const globalProviders: Provider[] = [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ThrottleInterceptor,
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
    ...getAppModules({ includeNext: !isTest }),
  ],
  providers: globalProviders,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyAppMiddlewares(consumer);
  }
}
