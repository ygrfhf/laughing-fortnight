/**
 * WCAG 2.x contrast ratio from hex colors (test-only).
 * https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio and #dfn-relative-luminance
 */

const HEX_COLOR = /^#([0-9a-f]{6})$/i;

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const match = HEX_COLOR.exec(hex);
  if (!match) {
    throw new Error(`Expected a 6-digit hex color like #1f2933, got "${hex}"`);
  }
  const value = match[1]!;
  const [r, g, b] = [0, 2, 4].map((i) => channelToLinear(parseInt(value.slice(i, i + 2), 16)));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Ratio from 1 (no contrast) to 21 (black on white); order of arguments does not matter. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter! + 0.05) / (darker! + 0.05);
}
