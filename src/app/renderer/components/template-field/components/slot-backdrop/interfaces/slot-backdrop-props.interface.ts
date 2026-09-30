import type { TemplatePart } from "../../../../../utils/text";

export interface SlotBackdropProps {
  value: string;
  /** Whether this piece is a slot; with no declared list, every name in braces is. */
  isSlot: (part: TemplatePart) => boolean;
}
