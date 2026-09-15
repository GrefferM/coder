import { useInteraction } from "../../../../../../../../hooks";
import {
  INTERACTION_ACCENT_COLOR,
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../../../constants";
import {
  SETTINGS_TICK_BORDER_RADIUS_PX,
  SETTINGS_TICK_BOX_BORDER_COLOR,
  SETTINGS_TICK_BOX_BORDER_RADIUS_PX,
  SETTINGS_TICK_BOX_SIZE_PX,
  SETTINGS_TICK_CHECK_COLOR,
  SETTINGS_TICK_CHECK_SIZE_PX,
  SETTINGS_TICK_GAP_PX,
  SETTINGS_TICK_GRANTED_NAME_COLOR,
  SETTINGS_TICK_NAME_COLOR,
  SETTINGS_TICK_NAME_FONT_SIZE_PX,
  SETTINGS_TICK_PADDING,
  SETTINGS_TICK_TOGGLE_LABEL,
} from "../../constants";
import type { ToolOptionProps } from "./interfaces";

/** One function in the open list; the tick both grants and revokes. */
export function ToolOption({ name, isGranted, onToggle }: ToolOptionProps) {
  const { isLit, handlers } = useInteraction();

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isGranted}
      aria-label={`${SETTINGS_TICK_TOGGLE_LABEL} ${name}`}
      onClick={onToggle}
      {...handlers}
      className="d-flex align-items-center text-start"
      style={{
        padding: SETTINGS_TICK_PADDING,
        gap: SETTINGS_TICK_GAP_PX,
        border: "none",
        borderRadius: SETTINGS_TICK_BORDER_RADIUS_PX,
        background: isGranted || isLit ? INTERACTION_HOVER_BACKGROUND_COLOR : "transparent",
        cursor: "pointer",
        transition: INTERACTION_TRANSITION,
      }}
    >
      <span
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: SETTINGS_TICK_BOX_SIZE_PX,
          height: SETTINGS_TICK_BOX_SIZE_PX,
          borderRadius: SETTINGS_TICK_BOX_BORDER_RADIUS_PX,
          border: `1px solid ${isGranted ? INTERACTION_ACCENT_COLOR : SETTINGS_TICK_BOX_BORDER_COLOR}`,
          background: isGranted ? INTERACTION_ACCENT_COLOR : "transparent",
          transition: INTERACTION_TRANSITION,
        }}
      >
        {isGranted && (
          <svg
            width={SETTINGS_TICK_CHECK_SIZE_PX}
            height={SETTINGS_TICK_CHECK_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={SETTINGS_TICK_CHECK_COLOR}
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        )}
      </span>
      <span
        className="font-monospace flex-fill text-truncate"
        style={{
          color: isGranted ? SETTINGS_TICK_GRANTED_NAME_COLOR : SETTINGS_TICK_NAME_COLOR,
          fontSize: SETTINGS_TICK_NAME_FONT_SIZE_PX,
        }}
      >
        {name}
      </span>
    </button>
  );
}
