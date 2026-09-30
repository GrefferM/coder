/** The bottom notes' offers: take a write back, and the two ways out of a failed one. */
export interface CanvasWriteActs {
  onUndo: (offerId: string) => void;
  onRetry: () => Promise<void>;
  onDismiss: () => void;
}
