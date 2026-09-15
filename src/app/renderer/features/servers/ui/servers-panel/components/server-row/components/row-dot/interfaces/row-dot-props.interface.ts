export interface RowDotProps {
  /** It is being raised right now — the dot takes the waiting colour and breathes. */
  isAsking: boolean;
  /** Nothing has been asked of it, or nothing came back — the dot stands empty. */
  isEmpty: boolean;
  /** The process is gone; the dot is coloured and still. */
  hasFallen: boolean;
  /** It answered — the one state that glows. */
  isUp: boolean;
}
