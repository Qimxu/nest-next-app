import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'core:throttle';

export type ThrottleOptions = {
  ttlMs?: number;
  limit?: number;
};

/**
 * Enable rate limiting for a route/controller.
 *
 * - If not applied, the route is not rate-limited.
 * - Options override defaults from config (`throttle.ttl`, `throttle.limit`).
 */
export function Throttle(options: ThrottleOptions = {}) {
  return SetMetadata(THROTTLE_KEY, options);
}
