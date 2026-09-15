import type { ProjectConfig } from "../../../../../interfaces";
import type { TakenThings, UndoOffer, WriteNote } from "../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** The one way the project's file is written, the note the write leaves, and the way back a deletion offers. */
export interface ProjectWrite {
  /** Writes the whole config; `label` is the note's word for it, `quietly` says only the failure. */
  save: (config: ProjectConfig, label?: string, quietly?: boolean) => Promise<void>;
  /** A deletion: off the screen, out of the folder, into the history, and thirty seconds to undo. */
  defer: (without: ProjectConfig, kind: string, name: string, message: string, place: Point | null) => Promise<void>;
  writeNote: WriteNote | null;
  retryWrite: () => Promise<void>;
  sayNote: (note: WriteNote) => void;
  dismissWriteNote: () => void;
  /** Every deletion still returnable, oldest first. */
  undoOffers: UndoOffer[];
  undoOffer: (offerId: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  restoreDeletion: (deletionId: string, taken: TakenThings) => Promise<void>;
}
