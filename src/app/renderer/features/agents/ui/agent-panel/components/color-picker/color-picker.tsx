import { AGENT_COLORS } from "../../../../constants";
import { FIELD_SLOT_CHANGED_BORDER_COLOR } from "../../../../../../components/field-slot/constants";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import {
  COLOR_PICKER_BACKGROUND_COLOR,
  COLOR_PICKER_BORDER_COLOR,
  COLOR_PICKER_BORDER_RADIUS_PX,
  COLOR_PICKER_CHOSEN_GAP_PX,
  COLOR_PICKER_CHOSEN_RING_PX,
  COLOR_PICKER_GAP_PX,
  COLOR_PICKER_HEX_COLOR,
  COLOR_PICKER_HEX_LETTER_SPACING_PX,
  COLOR_PICKER_PADDING,
  COLOR_PICKER_SWATCH_BORDER_RADIUS_PX,
  COLOR_PICKER_SWATCH_SIZE_PX,
} from "./constants";
import { Mark } from "../../../../../../components";
import type { ColorPickerProps } from "./interfaces";

/** The five agent colours; the chosen swatch is ringed in its own colour. */
export function ColorPicker({ color, isChanged = false, onColorChange }: ColorPickerProps) {
  return (
    <div
      // Five swatches, one tab stop; arrows walk the row.
      data-choice
      className="d-flex align-items-center"
      style={{
        gap: COLOR_PICKER_GAP_PX,
        padding: COLOR_PICKER_PADDING,
        borderRadius: COLOR_PICKER_BORDER_RADIUS_PX,
        border: `1px solid ${isChanged ? FIELD_SLOT_CHANGED_BORDER_COLOR : COLOR_PICKER_BORDER_COLOR}`,
        background: COLOR_PICKER_BACKGROUND_COLOR,
      }}
    >
      {AGENT_COLORS.map((swatch) => (
        <button
          key={swatch}
          type="button"
          aria-label={swatch}
          aria-pressed={swatch === color}
          onClick={() => onColorChange(swatch)}
          className="flex-shrink-0"
          style={{
            width: COLOR_PICKER_SWATCH_SIZE_PX,
            height: COLOR_PICKER_SWATCH_SIZE_PX,
            padding: 0,
            border: "none",
            borderRadius: COLOR_PICKER_SWATCH_BORDER_RADIUS_PX,
            background: swatch,
            boxShadow:
              swatch === color
                ? `0 0 0 ${COLOR_PICKER_CHOSEN_GAP_PX}px ${COLOR_PICKER_BACKGROUND_COLOR}, 0 0 0 ${COLOR_PICKER_CHOSEN_RING_PX}px ${swatch}`
                : undefined,
            cursor: "pointer",
            transition: INTERACTION_TRANSITION,
          }}
        />
      ))}
      <Mark color={COLOR_PICKER_HEX_COLOR} spacing={COLOR_PICKER_HEX_LETTER_SPACING_PX} className="ms-auto">
        {color}
      </Mark>
    </div>
  );
}
