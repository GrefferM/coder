export interface RowDotProps {
  /** Being raised right now: waiting colour, breathing. */
  isAsking: boolean;
  /** Nothing asked of it, or nothing came back: the dot stands empty. */
  isEmpty: boolean;
  /** The process is gone; the dot is coloured and still. */
  hasFallen: boolean;
  /** It answered — the one state that glows. */
  isUp: boolean;
}
