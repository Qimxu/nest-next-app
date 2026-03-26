import type { MiddlewareConsumer } from '@nestjs/common';
import { SecurityMiddleware } from './security.middleware';

/**
 * Central place to control middleware order.
 * Order matters: earlier entries run first.
 */
export const appMiddlewares = [
  {
    middleware: SecurityMiddleware,
    routes: '*',
  },
] as const;

export function applyAppMiddlewares(consumer: MiddlewareConsumer) {
  for (const entry of appMiddlewares) {
    // Nest supports passing a string, RouteInfo, or array of them.
    consumer.apply(entry.middleware as any).forRoutes(entry.routes as any);
  }
}
