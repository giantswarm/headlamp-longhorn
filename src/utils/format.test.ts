import { describe, expect, it } from 'vitest';
import { formatBool, orDash } from './format';

describe('formatBool', () => {
  it('maps booleans to Yes/No', () => {
    expect(formatBool(true)).toBe('Yes');
    expect(formatBool(false)).toBe('No');
  });

  it('returns a dash for missing values', () => {
    expect(formatBool(undefined)).toBe('-');
    expect(formatBool(null)).toBe('-');
  });
});

describe('orDash', () => {
  it('falls back to a dash for empty values', () => {
    expect(orDash(undefined)).toBe('-');
    expect(orDash(null)).toBe('-');
    expect(orDash('')).toBe('-');
  });

  it('stringifies present values', () => {
    expect(orDash('attached')).toBe('attached');
    expect(orDash(3)).toBe('3');
    expect(orDash(0)).toBe('0');
  });
});
