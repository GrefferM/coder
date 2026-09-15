import { IconButton } from "../../../../../../../../../../components";
import { INTERACTION_HOVER_TEXT_COLOR } from "../../../../../../../../../../constants";

import {
  VALUES_FIELD_CHIP_BACKGROUND_COLOR,
  VALUES_FIELD_CHIP_BORDER_RADIUS_PX,
  VALUES_FIELD_CHIP_COLOR,
  VALUES_FIELD_CHIP_PADDING,
  VALUES_FIELD_FONT_SIZE_PX,
  VALUES_FIELD_GAP_PX,
  VALUES_FIELD_REMOVE_COLOR,
  VALUES_FIELD_REMOVE_LABEL,
  VALUES_FIELD_REMOVE_SIZE_PX,
} from "../../constants";
import type { ValueChipProps } from "./interfaces";

/** One added value with its remove cross. */
export function ValueChip({ value, onRemove }: ValueChipProps) {
  return (
    <span
      className="d-flex align-items-center font-monospace"
      style={{
        padding: VALUES_FIELD_CHIP_PADDING,
        gap: VALUES_FIELD_GAP_PX,
        borderRadius: VALUES_FIELD_CHIP_BORDER_RADIUS_PX,
        background: VALUES_FIELD_CHIP_BACKGROUND_COLOR,
        color: VALUES_FIELD_CHIP_COLOR,
        fontSize: VALUES_FIELD_FONT_SIZE_PX,
      }}
    >
      {value}
      <IconButton
        label={`${VALUES_FIELD_REMOVE_LABEL} ${value}`}
        onPress={onRemove}
        tone={{
          rest: VALUES_FIELD_REMOVE_COLOR,
          lit: INTERACTION_HOVER_TEXT_COLOR,
        }}
      >
        <svg
          width={VALUES_FIELD_REMOVE_SIZE_PX}
          height={VALUES_FIELD_REMOVE_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </IconButton>
    </span>
  );
}
