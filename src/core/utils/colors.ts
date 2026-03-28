/**
 * Color manipulation utilities for component rendering.
 * Components use these to derive hover/pressed states from base theme colors.
 */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    clamp(r).toString(16).padStart(2, '0') +
    clamp(g).toString(16).padStart(2, '0') +
    clamp(b).toString(16).padStart(2, '0')
  );
}

/** Lighten a hex color by mixing with white. `amount` ∈ [0, 1]. */
export function lighten(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

/** Darken a hex color by mixing with black. `amount` ∈ [0, 1]. */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** Add alpha channel to a hex color. `alpha` ∈ [0, 1]. Returns `#RRGGBBAA`. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '').substring(0, 6);
  const a = Math.max(0, Math.min(255, Math.round(alpha * 255)));
  return '#' + h + a.toString(16).padStart(2, '0');
}
