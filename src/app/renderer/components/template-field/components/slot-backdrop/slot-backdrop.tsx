import { templateParts } from "../../../../utils/text";
import {
  TEMPLATE_FIELD_SLOT_BACKGROUND_COLOR,
  TEMPLATE_FIELD_SLOT_BORDER_RADIUS_PX,
  TEMPLATE_FIELD_SLOT_COLOR,
  TEMPLATE_FIELD_SLOT_MARGIN,
  TEMPLATE_FIELD_SLOT_PADDING,
} from "../../constants";
import type { SlotBackdropProps } from "./interfaces";

/** The coloured pieces under the transparent glyphs — a declared name in braces is drawn as a slot. */
export function SlotBackdrop({ value, isSlot }: SlotBackdropProps) {
  return (
    <>
      {templateParts(value).map((part, index) => (
        <span
          // Parts are positional pieces of one string; the index is the identity.
          key={index}
          style={
            isSlot(part)
              ? {
                  padding: TEMPLATE_FIELD_SLOT_PADDING,
                  margin: TEMPLATE_FIELD_SLOT_MARGIN,
                  borderRadius: TEMPLATE_FIELD_SLOT_BORDER_RADIUS_PX,
                  background: TEMPLATE_FIELD_SLOT_BACKGROUND_COLOR,
                  color: TEMPLATE_FIELD_SLOT_COLOR,
                }
              : undefined
          }
        >
          {part.text}
        </span>
      ))}
    </>
  );
}
