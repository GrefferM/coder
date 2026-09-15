export interface FunctionOptionProps {
  name: string;
  /** The server's own words about it, as they came: it writes them for the model, and we do not rewrite them. */
  said: string;
  isHeld: boolean;
  textGapPx: number;
  onToggle: () => void;
}
