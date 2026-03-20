import { Controller, All, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { NextService } from './next.service';
import { Public } from '@/core/decorators';
import type { Request, Response } from 'express';

/**
 * Next.js 控制器 - 处理所有非 API 请求
 *
 * 请求处理顺序：
 * 请求 → Nest 中间件 → 路由判断 → (Nest API 控制器 或 Next.js 渲染)
 *
 * 此控制器作为兜底，处理所有未被 Nest API 路由匹配的请求
 */
@ApiExcludeController()
@Controller()
export class NextController {
  constructor(private readonly nextService: NextService) {}

  /**
   * 兜底路由 - 处理所有其他请求 (页面、国际化路由等)
   */
  @All('*')
  @Public()
  async handleRouter(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ) {
    return await this.nextService.handleRequest(req, res);
  }
}
