import { useState } from "react";
import { INTERACTION_TRANSITION } from "../../constants";
import {
  SEGMENTED_CHIP_BORDER_COLOR,
  SEGMENTED_CHIP_CHOSEN_BORDER_COLOR,
  SEGMENTED_CHIP_FONT_SIZE_PX,
  SEGMENTED_CHOSEN_BACKGROUND_COLOR,
  SEGMENTED_CHOSEN_COLOR,
  SEGMENTED_COLOR,
  SEGMENTED_OPTION_BORDER_RADIUS_PX,
  SEGMENTED_OPTION_FONT_SIZE_PX,
  SEGMENTED_OPTION_PADDING,
  SEGMENTED_TRACK_BACKGROUND_COLOR,
  SEGMENTED_TRACK_BORDER_COLOR,
  SEGMENTED_TRACK_BORDER_RADIUS_PX,
  SEGMENTED_TRACK_GAP_PX,
  SEGMENTED_TRACK_PADDING_PX,
} from "./constants";
import type { SegmentedProps } from "./interfaces";

/** Segmented choice — options on one track, or as chips for machine-read names. */
export function Segmented<Value extends string>({ options, value, onChange, isChips = false }: SegmentedProps<Value>) {
  const [pointedAtValue, setPointedAtValue] = useState<Value | null>(null);

  return (
    <div
      // The row is one value, so the keyboard stops on the chosen option and the arrows move it.
      data-choice
      className="d-flex"
      style={{
        gap: SEGMENTED_TRACK_GAP_PX,
        padding: isChips ? 0 : SEGMENTED_TRACK_PADDING_PX,
        borderRadius: isChips ? undefined : SEGMENTED_TRACK_BORDER_RADIUS_PX,
        border: isChips ? undefined : `1px solid ${SEGMENTED_TRACK_BORDER_COLOR}`,
        background: isChips ? undefined : SEGMENTED_TRACK_BACKGROUND_COLOR,
      }}
    >
      {options.map((option) => {
        const isChosen = option.value === value;
        // An unchosen option brightens its text on hover, with no background.
        const isLit = pointedAtValue === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isChosen}
            onClick={() => onChange(option.value)}
            onMouseEnter={() => setPointedAtValue(option.value)}
            onMouseLeave={() => setPointedAtValue((current) => (current === option.value ? null : current))}
            className={`flex-fill text-center${isChips ? " font-monospace" : ""}`}
            style={{
              padding: SEGMENTED_OPTION_PADDING,
              border: isChips
                ? `1px solid ${isChosen ? SEGMENTED_CHIP_CHOSEN_BORDER_COLOR : SEGMENTED_CHIP_BORDER_COLOR}`
                : "none",
              borderRadius: SEGMENTED_OPTION_BORDER_RADIUS_PX,
              background: isChosen ? SEGMENTED_CHOSEN_BACKGROUND_COLOR : "transparent",
              color: isChosen || isLit ? SEGMENTED_CHOSEN_COLOR : SEGMENTED_COLOR,
              fontSize: isChips ? SEGMENTED_CHIP_FONT_SIZE_PX : SEGMENTED_OPTION_FONT_SIZE_PX,
              cursor: "pointer",
              transition: INTERACTION_TRANSITION,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
