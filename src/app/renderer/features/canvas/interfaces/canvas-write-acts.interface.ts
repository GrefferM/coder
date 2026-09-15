/** What the notes along the bottom offer: taking a write back, and the two ways out of one that failed. */
export interface CanvasWriteActs {
  onUndo: (offerId: string) => void;
  onRetry: () => Promise<void>;
  onDismiss: () => void;
}
