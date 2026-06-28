/**
 * Render a boolean as "Yes"/"No" instead of the raw "true"/"false" strings.
 * Returns "-" when the value is missing.
 */
export function formatBool(value?: boolean | null): string {
  if (value === undefined || value === null) {
    return '-';
  }
  return value ? 'Yes' : 'No';
}

/** Render a value, falling back to "-" for null/undefined/empty. */
export function orDash(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return String(value);
}
