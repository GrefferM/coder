import type { UndoOffer } from "../../../../../project";

/** `offers` is oldest first; the last one is the newest and the one ⌘Z takes. */
export interface UndoStackProps {
  offers: UndoOffer[];
  onUndo: (offerId: string) => void;
}
