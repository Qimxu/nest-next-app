import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PUBLIC_KEY } from '@/core/decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // /_next 路径直接通过（Next.js 静态资源）
    if (request.path?.startsWith('/_next')) {
      return true;
    }

    // 静态资源路径直接通过
    if (request.path?.startsWith('/static')) {
      return true;
    }

    // 检查是否标记为公开接口（默认需要认证）
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 标记为公开则无需认证
    if (isPublic) {
      return true;
    }

    // 执行 JWT 验证
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }

    // 将 token 存储到 request 中，用于后续检查黑名单
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    request.token = token;

    return user;
  }

  private extractToken(request: any): string | null {
    const authorization = request.headers?.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.substring(7);
    }
    return null;
  }
}
