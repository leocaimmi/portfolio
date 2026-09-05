import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRateLimiter } from '@/lib/rate-limit';

describe('rate limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows up to the limit and then refuses', () => {
    const check = createRateLimiter({ limit: 3, windowMs: 60_000 });

    expect(check('1.2.3.4').allowed).toBe(true);
    expect(check('1.2.3.4').allowed).toBe(true);
    expect(check('1.2.3.4').allowed).toBe(true);
    expect(check('1.2.3.4').allowed).toBe(false);
  });

  it('counts each key separately', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(check('first').allowed).toBe(true);
    expect(check('first').allowed).toBe(false);
    expect(check('second').allowed).toBe(true);
  });

  it('lets a caller back in once the window has passed', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(check('caller').allowed).toBe(true);
    expect(check('caller').allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(check('caller').allowed).toBe(true);
  });

  it('reports how long to wait, so the response can say Retry-After', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });

    check('caller');
    vi.advanceTimersByTime(20_000);

    const refused = check('caller');

    expect(refused.allowed).toBe(false);
    expect(refused.retryAfterSeconds).toBe(40);
  });

  /*
   * A refused request must not extend the window, or a caller hammering the
   * endpoint would lock themselves out indefinitely.
   */
  it('does not push the window back when it refuses', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 10_000 });

    check('caller');

    vi.advanceTimersByTime(5_000);
    expect(check('caller').allowed).toBe(false);

    vi.advanceTimersByTime(5_001);
    expect(check('caller').allowed).toBe(true);
  });
});
