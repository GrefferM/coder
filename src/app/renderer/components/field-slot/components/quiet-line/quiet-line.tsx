import { FIELD_SLOT_QUIET_LINE_HEIGHT, FIELD_SLOT_TROUBLE_COLOR } from "../../constants";
import { Mark } from "../../../mark";
import type { QuietLineProps } from "./interfaces";

/**
 * Quiet line under a field's box: «БУЛО · …» or the field's purpose.
 *
 * The same line carries the refusal when the field is refused — «межу видно до того, як у неї
 * впертись», and the line that taught the rule is the line that says it was broken. Only its colour changes.
 */
export function QuietLine({ children, isTroubled = false }: QuietLineProps) {
  return (
    <Mark lineHeight={FIELD_SLOT_QUIET_LINE_HEIGHT} color={isTroubled ? FIELD_SLOT_TROUBLE_COLOR : undefined}>
      {children}
    </Mark>
  );
}
