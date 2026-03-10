import { Module, Global } from '@nestjs/common';
import { WinstonLoggerService } from './winston.logger';

@Global()
@Module({
  providers: [
    {
      provide: 'LoggerService',
      useClass: WinstonLoggerService,
    },
  ],
  exports: ['LoggerService'],
})
export class LoggerModule {}
