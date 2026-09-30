import type { UndoOffer } from "../../../../../project";

/** `offers` is oldest first; the last is the newest, the one ⌘Z takes. */
export interface UndoStackProps {
  offers: UndoOffer[];
  onUndo: (offerId: string) => void;
}
