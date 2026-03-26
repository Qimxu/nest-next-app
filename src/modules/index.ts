export { AuthModule } from './auth/auth.module';
export { UsersModule } from './users/users.module';
export { RedisModule } from './redis/redis.module';
export { NextModule } from './next/next.module';
export { HealthModule } from './health/health.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { NextModule } from './next/next.module';
import { HealthModule } from './health/health.module';

export function getAppModules(options: { includeNext?: boolean } = {}) {
  const { includeNext = true } = options;
  const base = [RedisModule, AuthModule, UsersModule, HealthModule];
  return includeNext ? [...base, NextModule] : base;
}
