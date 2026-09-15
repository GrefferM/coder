import type { TakenThings, UndoOffer } from "../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** The offers standing under the canvas, oldest first. */
export interface UndoOffers {
  offers: UndoOffer[];
  offer: (made: { deletionId: string | null; taken: TakenThings; message: string; place: Point | null }) => void;
  take: (id: string) => UndoOffer | null;
  takeOfDeletion: (deletionId: string) => void;
}
