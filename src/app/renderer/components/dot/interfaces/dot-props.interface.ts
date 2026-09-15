export interface DotProps {
  /** What the dot stands for: an agent's colour, a state's, or `transparent` where the dot is an outline. */
  color: string;
  size: number;
  /** The blur of the glow, in pixels; the glow takes the dot's own colour. */
  glow?: number;
  /** The edge of a dot that is not filled in. */
  border?: string;
  /** Where the dot stands in its row — the layout is the caller's, the shape is the dot's. */
  className?: string;
  /**
   * What this dot says, for a reader who cannot see it. A dot beside a word it belongs to needs none — the word is
   * already there; a dot standing alone as a sign of its own is named here, or it says nothing at all.
   */
  label?: string;
}
