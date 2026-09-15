import { WHITE_COLOR } from "./constants";

/** A CSS `color-mix` expression lightening `color` by mixing `percent`% of white into it. */
export function mixWithWhite(color: string, percent: number): string {
  return `color-mix(in srgb, ${WHITE_COLOR} ${percent}%, ${color})`;
}
