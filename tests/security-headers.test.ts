import { describe, expect, it } from 'vitest';

import { securityHeaders } from '@/lib/security-headers';

const asRecord = (isDevelopment: boolean) =>
  Object.fromEntries(securityHeaders(isDevelopment).map(({ key, value }) => [key, value]));

describe('security headers', () => {
  it('locks down the directives that have no legitimate use here', () => {
    const csp = asRecord(false)['Content-Security-Policy'] ?? '';

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'none'");
    expect(csp).toContain("form-action 'self'");
  });

  it('allows no external origin, because everything is self-hosted', () => {
    const csp = asRecord(false)['Content-Security-Policy'] ?? '';

    expect(csp).not.toMatch(/https?:\/\//);
  });

  /*
   * The development build needs eval for Fast Refresh and a websocket for
   * hot updates. Neither exists in production, and letting either leak into
   * the production policy would quietly undo most of it.
   */
  it('keeps the development-only relaxations out of production', () => {
    const production = asRecord(false)['Content-Security-Policy'] ?? '';
    const development = asRecord(true)['Content-Security-Policy'] ?? '';

    expect(development).toContain("'unsafe-eval'");
    expect(development).toContain('ws:');

    expect(production).not.toContain("'unsafe-eval'");
    expect(production).not.toContain('ws:');
  });

  it('upgrades insecure requests in production only', () => {
    expect(asRecord(false)['Content-Security-Policy']).toContain('upgrade-insecure-requests');
    expect(asRecord(true)['Content-Security-Policy']).not.toContain('upgrade-insecure-requests');
  });

  it('sends HSTS in production and never on localhost', () => {
    expect(asRecord(false)['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(asRecord(true)['Strict-Transport-Security']).toBeUndefined();
  });

  it('sends the supporting headers in both environments', () => {
    for (const isDevelopment of [true, false]) {
      const headers = asRecord(isDevelopment);

      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
      expect(headers['Permissions-Policy']).toContain('camera=()');
    }
  });
});
