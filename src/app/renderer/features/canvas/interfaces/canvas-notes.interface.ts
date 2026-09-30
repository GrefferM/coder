import type { UndoOffer, WriteNote } from "../../project";

/** What the canvas says along its bottom: an offer to put something back, and the file. */
export interface CanvasNotes {
  /** Every deletion still returnable, oldest first. */
  undoOffers: UndoOffer[];
  writeNote: WriteNote | null;
}
