/** All the walk asks of a key press, so a field's keys and the window's keys are one thing to it. */
export interface WalkedKey {
  key: string;
  preventDefault: () => void;
}
