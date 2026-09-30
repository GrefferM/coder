export interface DotProps {
  /** An agent's or a state's colour, or `transparent` for an outline dot. */
  color: string;
  size: number;
  /** Glow blur in pixels; the glow takes the dot's colour. */
  glow?: number;
  /** The edge of a dot that is not filled in. */
  border?: string;
  /** Placement in the caller's row; the layout is the caller's. */
  className?: string;
  /** Accessible name; only a dot standing alone needs one. */
  label?: string;
}
