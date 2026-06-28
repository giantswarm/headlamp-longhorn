import { describe, expect, it } from 'vitest';
import { humanizeBytes } from './bytes';

describe('humanizeBytes', () => {
  it('renders binary units', () => {
    expect(humanizeBytes(5368709120)).toBe('5 Gi');
    expect(humanizeBytes(1024)).toBe('1 Ki');
    expect(humanizeBytes(1048576)).toBe('1 Mi');
    expect(humanizeBytes(1099511627776)).toBe('1 Ti');
  });

  it('accepts numeric strings (as Longhorn reports them)', () => {
    expect(humanizeBytes('5368709120')).toBe('5 Gi');
  });

  it('keeps small byte counts in bytes', () => {
    expect(humanizeBytes(512)).toBe('512 B');
    expect(humanizeBytes(0)).toBe('0 B');
  });

  it('rounds fractional values to two decimals', () => {
    expect(humanizeBytes(1536)).toBe('1.5 Ki');
    expect(humanizeBytes(1610612736)).toBe('1.5 Gi');
  });

  it('returns a dash for empty values', () => {
    expect(humanizeBytes(undefined)).toBe('-');
    expect(humanizeBytes(null)).toBe('-');
    expect(humanizeBytes('')).toBe('-');
  });

  it('echoes back non-numeric input unchanged', () => {
    expect(humanizeBytes('not-a-number')).toBe('not-a-number');
  });
});
