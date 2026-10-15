import type { LinkTally } from "../../../../interfaces";
import type { UndoOffer, WriteNote } from "../../../../../project";

/** What floats over the field: the counts, the scale, the write note along the top and the undo offers along the bottom. */
export interface CanvasOverProps {
  /** The selected sphere's lines both ways; null when nothing is selected. */
  tally: LinkTally | null;
  scale: number;
  /** Every deletion still returnable, oldest first. */
  undoOffers: UndoOffer[];
  writeNote: WriteNote | null;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onWriteRetry: () => Promise<void>;
  onWriteDismiss: () => void;
  onUndo: (offerId: string) => void;
}
