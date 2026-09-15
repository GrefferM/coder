/** `isOlder` is every row but the newest: dimmer, and without the shadow that lifts the bottom one. */
export interface UndoLineProps {
  message: string;
  secondsLeft: number;
  isOlder?: boolean;
  onUndo: () => void;
}
