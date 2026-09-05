import { describe, expect, it } from 'vitest';

import { formatMonth, formatPeriod } from '@/lib/format-period';

describe('formatMonth', () => {
  /*
   * The regression this guards: `new Date('2025-03')` parses as UTC midnight,
   * which renders as February for anyone west of Greenwich. Building the date
   * from its parts keeps it in local time.
   */
  it('does not slip to the previous month in western time zones', () => {
    expect(formatMonth('2025-03', 'en')).toContain('2025');
    expect(formatMonth('2025-03', 'en')).toMatch(/Mar/);
    expect(formatMonth('2025-01', 'en')).toMatch(/Jan/);
    expect(formatMonth('2025-12', 'en')).toMatch(/Dec/);
  });

  it('formats in the requested locale', () => {
    expect(formatMonth('2025-03', 'es')).not.toBe(formatMonth('2025-03', 'en'));
  });

  it('returns the input unchanged when it cannot be parsed', () => {
    expect(formatMonth('nonsense', 'en')).toBe('nonsense');
  });
});

describe('formatPeriod', () => {
  it('renders a closed range', () => {
    const formatted = formatPeriod({ start: '2023-02', end: '2024-12' }, 'en', 'Present');

    expect(formatted).toMatch(/2023/);
    expect(formatted).toMatch(/2024/);
    expect(formatted).not.toContain('Present');
  });

  it('uses the caller-supplied label for an open range', () => {
    expect(formatPeriod({ start: '2025-10', end: null }, 'es', 'Presente')).toContain('Presente');
    expect(formatPeriod({ start: '2025-10', end: null }, 'en', 'Present')).toContain('Present');
  });
});
