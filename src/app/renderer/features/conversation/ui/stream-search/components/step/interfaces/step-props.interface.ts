export interface StepProps {
  label: string;
  /** The glyph itself, as one path: an arrow either way, or the cross that takes the word out. */
  path: string;
  /** Nothing found, so there is nowhere to walk: it dims to unpressable and keeps its place. */
  isSpent: boolean;
  onGo: () => void;
  size?: number;
  stroke?: string;
}
