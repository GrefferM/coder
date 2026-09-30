import { useInteraction } from "../../../../hooks";
import { focusRing } from "../../../../utils/focus";
import { INTERACTION_TRANSITION } from "../../../../constants";
import {
  DEBUG_BAND_COLOR,
  DEBUG_BAND_FONT_SIZE_PX,
  DEBUG_BAND_GAP_PX,
  DEBUG_BAND_ICON_PATH,
  DEBUG_BAND_ICON_SIZE_PX,
  DEBUG_BAND_ICON_STROKE,
  DEBUG_BAND_LABEL,
  DEBUG_BAND_LETTER_SPACING_PX,
  DEBUG_BAND_REST_OPACITY,
} from "./constants";
import type { DebugBandProps } from "./interfaces";

/** «ДЕБАҐ ЗАПУСКУ» over its question: the way into that pass's flat projection. */
export function DebugBand({ onOpen }: DebugBandProps) {
  const open = useInteraction();

  return (
    <button
      type="button"
      onClick={onOpen}
      {...open.handlers}
      className="d-flex align-items-center font-monospace text-uppercase"
      style={{
        gap: DEBUG_BAND_GAP_PX,
        padding: 0,
        border: "none",
        background: "transparent",
        color: DEBUG_BAND_COLOR,
        fontSize: DEBUG_BAND_FONT_SIZE_PX,
        letterSpacing: `${DEBUG_BAND_LETTER_SPACING_PX}px`,
        opacity: open.isLit ? 1 : DEBUG_BAND_REST_OPACITY,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(open.isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      {DEBUG_BAND_LABEL}
      <svg
        width={DEBUG_BAND_ICON_SIZE_PX}
        height={DEBUG_BAND_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={DEBUG_BAND_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={DEBUG_BAND_ICON_PATH} />
      </svg>
    </button>
  );
}
