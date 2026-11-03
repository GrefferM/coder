import type { LinkTally } from "../../../../interfaces";
import type { UndoOffer, WriteNote } from "../../../../../project";

/** What floats over the field: counts, scale, the write note on top and the undo offers at the bottom. */
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
