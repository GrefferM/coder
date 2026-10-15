/** The notes' acts: take a deletion back, and the two ways out of a failed write. */
export interface CanvasWriteActs {
  onUndo: (offerId: string) => void;
  onRetry: () => Promise<void>;
  onDismiss: () => void;
}
