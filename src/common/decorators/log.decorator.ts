import { UseInterceptors } from '@nestjs/common';
import { LogInterceptor } from '../interceptors/log.interceptor';

export function Log() {
  return UseInterceptors(LogInterceptor);
}
