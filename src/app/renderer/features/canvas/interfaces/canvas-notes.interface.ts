import type { UndoOffer, WriteNote } from "../../project";

/** What the canvas says over the field: undo offers along the bottom, the write note along the top. */
export interface CanvasNotes {
  /** Every deletion still returnable, oldest first. */
  undoOffers: UndoOffer[];
  writeNote: WriteNote | null;
}
