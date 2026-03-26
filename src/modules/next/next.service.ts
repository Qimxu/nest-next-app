import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import next from 'next';
import type { Request, Response } from 'express';

@Injectable()
export class NextService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NextService.name);
  private app: ReturnType<typeof next> | null = null;
  private handler: ((req: Request, res: Response) => Promise<void>) | null =
    null;

  private readonly config = {
    skip: ['/.well-known/', '/favicon'],
    silent: ['/_next/', '/static/'],
  };

  async onModuleInit() {
    process.env.NEXT_TELEMETRY_DISABLED = '1';

    // Next.js 16 默认启用 Turbopack，但开发模式下与项目集成有兼容性问题
    // 在开发模式下禁用 Turbopack，使用 webpack 模式
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      process.env.TURBOPACK = '0';
    }

    this.app = next({
      dev: isDev,
      quiet: true,
    });
    await this.app.prepare();
    this.handler = this.app.getRequestHandler();
    this.logger.log('Next.js initialized');
  }

  async onModuleDestroy() {
    await this.app?.close();
  }

  handleRequest(req: Request, res: Response) {
    if (!this.handler)
      return res.status(200).json({ error: 'Next.js not initialized' });
    if (this.config.skip.some((p) => req.path.startsWith(p)))
      return res.status(200).end();
    if (!this.config.silent.some((p) => req.path.startsWith(p)))
      this.logger.log(`${req.method} ${req.path} → Next.js`);
    return this.handler(req, res);
  }
}
