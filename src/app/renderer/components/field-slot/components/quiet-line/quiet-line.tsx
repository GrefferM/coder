import { FIELD_SLOT_QUIET_LINE_HEIGHT, FIELD_SLOT_TROUBLE_COLOR } from "../../constants";
import { Mark } from "../../../mark";
import type { QuietLineProps } from "./interfaces";

/**
 * Quiet line under a field's box: «БУЛО · …» or the field's purpose; the same line carries the refusal, only its colour
 * changes.
 */
export function QuietLine({ children, isTroubled = false }: QuietLineProps) {
  return (
    <Mark lineHeight={FIELD_SLOT_QUIET_LINE_HEIGHT} color={isTroubled ? FIELD_SLOT_TROUBLE_COLOR : undefined}>
      {children}
    </Mark>
  );
}
