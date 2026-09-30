import type { LinkTally } from "../../../../interfaces";
import type { UndoOffer, WriteNote } from "../../../../../project";

/** What floats over the field in its corners: the counts, the scale, and the bottom notes. */
export interface CanvasOverProps {
  /** The selected sphere's lines both ways; null when nothing is selected. */
  tally: LinkTally | null;
  scale: number;
  /** Every deletion still returnable, oldest first. */
  undoOffers: UndoOffer[];
  /** The file's note, which takes the offers' place while it stands. */
  writeNote: WriteNote | null;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onWriteRetry: () => Promise<void>;
  onWriteDismiss: () => void;
  onUndo: (offerId: string) => void;
}
