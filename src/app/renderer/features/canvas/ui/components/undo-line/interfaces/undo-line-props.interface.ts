/** `isOlder` is every row but the newest: dimmer, without the shadow of the bottom one. */
export interface UndoLineProps {
  message: string;
  secondsLeft: number;
  isOlder?: boolean;
  onUndo: () => void;
}
