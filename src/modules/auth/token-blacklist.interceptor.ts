import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TokenBlacklistInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TokenBlacklistInterceptor.name);
  private readonly TOKEN_BLACKLIST_PREFIX = 'token_blacklist:';

  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // 如果有 token，检查是否在黑名单中
    const token = this.extractToken(request);
    if (token) {
      const isBlacklisted = await this.redisService.exists(
        `${this.TOKEN_BLACKLIST_PREFIX}${token}`,
      );
      if (isBlacklisted) {
        this.logger.warn(`Blacklisted token used - Path: ${request.path}`);
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    return next.handle();
  }

  private extractToken(request: any): string | null {
    const authorization = request.headers?.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.substring(7);
    }
    return null;
  }
}
