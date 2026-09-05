import 'server-only';

interface RateLimiterOptions {
  /** Requests allowed inside one window. */
  limit: number;
  windowMs: number;
  /** Upper bound on tracked keys, so the map cannot grow without limit. */
  maxKeys?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait, for the `Retry-After` header. */
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limiter held in process memory.
 *
 * Deliberately dependency-free. The trade-off is that the counter is per
 * instance: on a platform that runs several serverless instances the effective
 * limit is the configured one multiplied by the number of warm instances. That
 * is acceptable for a contact form, whose purpose is to blunt casual abuse
 * rather than to enforce a quota. A shared store such as Redis would be the
 * upgrade path if this ever guarded something that mattered.
 */
export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: RateLimiterOptions) {
  const hits = new Map<string, number[]>();

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Drop expired keys opportunistically so idle traffic cleans up after itself.
    if (hits.size > maxKeys) {
      for (const [existingKey, timestamps] of hits) {
        if (timestamps.every((timestamp) => timestamp <= windowStart)) {
          hits.delete(existingKey);
        }
      }
    }

    const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

    if (recent.length >= limit) {
      const oldest = recent[0] ?? now;

      hits.set(key, recent);

      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
      };
    }

    recent.push(now);
    hits.set(key, recent);

    return { allowed: true, retryAfterSeconds: 0 };
  };
}
