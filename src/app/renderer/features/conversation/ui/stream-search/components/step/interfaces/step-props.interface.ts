export interface StepProps {
  label: string;
  /** The glyph as one path: an arrow either way, or the cross. */
  path: string;
  /** Nothing found: dims, unpressable, keeps its place. */
  isSpent: boolean;
  onGo: () => void;
  size?: number;
  stroke?: string;
}
