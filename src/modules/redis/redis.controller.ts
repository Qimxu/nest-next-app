import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RedisService } from './redis.service';

@ApiTags('redis')
@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test Redis connection' })
  @ApiResponse({ status: 200, description: 'Redis connection status' })
  async testRedis() {
    const key = `redis:test:${Date.now()}`;
    await this.redisService.set(key, 'ok', 30);
    const value = await this.redisService.get(key);
    return {
      status: 'connected',
      write: 'success',
      read: value === 'ok' ? 'success' : 'failed',
    };
  }
}
