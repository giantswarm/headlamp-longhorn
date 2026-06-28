const UNITS = ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'];

/**
 * Render a raw byte count (Longhorn reports these as numbers or numeric
 * strings) as a human-readable binary size, e.g. 5368709120 -> "5 Gi".
 * Returns "-" for empty values and echoes back non-numeric input unchanged.
 */
export function humanizeBytes(value?: number | string | null): string {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const bytes = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(bytes)) {
    return String(value);
  }
  if (bytes === 0) {
    return '0 B';
  }

  const negative = bytes < 0;
  let n = Math.abs(bytes);
  let unit = 0;
  while (n >= 1024 && unit < UNITS.length - 1) {
    n /= 1024;
    unit += 1;
  }

  // Keep up to two decimals for fractional values; drop trailing zeros.
  const rounded = unit === 0 ? n : Math.round(n * 100) / 100;
  return `${negative ? '-' : ''}${rounded} ${UNITS[unit]}`;
}
