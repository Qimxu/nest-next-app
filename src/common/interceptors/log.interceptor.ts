import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { body, params, query } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const startTime = Date.now();

    this.logger.log(
      `[${className}] ${handlerName} - Params: ${JSON.stringify({ ...params, ...query, ...body })}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${className}] ${handlerName} - Response: ${JSON.stringify(data)} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${className}] ${handlerName} - Error: ${error.message} - ${duration}ms`,
          );
        },
      }),
    );
  }
}
