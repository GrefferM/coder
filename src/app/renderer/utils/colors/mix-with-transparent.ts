/** A CSS `color-mix` expression blending `color` toward transparent, keeping `percent`% of its opacity. */
export function mixWithTransparent(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}
