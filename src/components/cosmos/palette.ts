export type Rgb = readonly [number, number, number];

export const PALETTE_TOKENS = [
  'star',
  'solar',
  'nebula',
  'nebula-glow',
  'comet',
  'starlight',
  'void',
] as const;

export type PaletteToken = (typeof PALETTE_TOKENS)[number];

export type Palette = Record<PaletteToken, Rgb>;

const FALLBACK: Rgb = [233, 237, 255];

/**
 * Parses `#rgb` or `#rrggbb`.
 *
 * Deliberately narrow: these values come from this project's own design
 * tokens, which are all hex, so anything else means the stylesheet changed and
 * the caller should hear about it as a visible fallback rather than a silent
 * mis-parse.
 */
function parseHex(value: string): Rgb | undefined {
  const hex = value.trim().replace('#', '');

  if (hex.length === 3) {
    const [r, g, b] = [...hex].map((character) => parseInt(character + character, 16));

    return r === undefined || g === undefined || b === undefined ? undefined : [r, g, b];
  }

  if (hex.length === 6) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  return undefined;
}

/**
 * Reads the design tokens off the document and parses them into RGB triples.
 *
 * Canvas cannot resolve `var(--color-star)`, and handing it an unparseable
 * colour is worse than useless: assigning an invalid value to `fillStyle` is
 * ignored, so the shape silently paints in whatever colour happened to be set
 * last. Resolving up front — once per resize, not once per draw — keeps every
 * fill explicit and keeps the canvas in step with the stylesheet.
 */
export function readPalette(element: Element): Palette {
  const styles = getComputedStyle(element);

  const entries = PALETTE_TOKENS.map((token) => {
    const raw = styles.getPropertyValue(`--color-${token}`);

    return [token, parseHex(raw) ?? FALLBACK] as const;
  });

  return Object.fromEntries(entries) as Palette;
}

/** Formats a palette colour at a given opacity for `fillStyle` or `strokeStyle`. */
export function rgba(color: Rgb, alpha: number): string {
  return `rgba(${String(color[0])}, ${String(color[1])}, ${String(color[2])}, ${String(alpha)})`;
}
