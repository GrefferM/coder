export interface FunctionOptionProps {
  name: string;
  /** The server's own words about it, unrewritten. */
  said: string;
  isHeld: boolean;
  textGapPx: number;
  onToggle: () => void;
}
