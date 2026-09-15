import { useInteraction } from "../../../../../../../../../../hooks";
import {
  INTERACTION_ACCENT_COLOR,
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../../../../../constants";
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
} from "../../../../constants";
import {
  SERVER_SCREEN_SAID_COLOR,
  SERVER_SCREEN_SAID_FONT_SIZE_PX,
  SERVER_SCREEN_SAID_LINE_HEIGHT,
} from "../../constants";
import type { FunctionOptionProps } from "./interfaces";

/**
 * One function of a server, on the screen behind its row: the tick, the name, and the server's own sentence about
 * it. The tick is the same act as the commands' — it grants and revokes — and the sentence is here because
 * twenty-four names alone tell nobody which of them to let through.
 */
export function FunctionOption({ name, said, isHeld, textGapPx, onToggle }: FunctionOptionProps) {
  const { isLit, handlers } = useInteraction();

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isHeld}
      aria-label={`${SETTINGS_TICK_TOGGLE_LABEL} ${name}`}
      onClick={onToggle}
      {...handlers}
      className="d-flex align-items-start text-start"
      style={{
        padding: SETTINGS_TICK_PADDING,
        gap: SETTINGS_TICK_GAP_PX,
        border: "none",
        borderRadius: SETTINGS_TICK_BORDER_RADIUS_PX,
        background: isHeld || isLit ? INTERACTION_HOVER_BACKGROUND_COLOR : "transparent",
        cursor: "pointer",
        transition: INTERACTION_TRANSITION,
      }}
    >
      <span
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: SETTINGS_TICK_BOX_SIZE_PX,
          height: SETTINGS_TICK_BOX_SIZE_PX,
          marginTop: textGapPx,
          borderRadius: SETTINGS_TICK_BOX_BORDER_RADIUS_PX,
          border: `1px solid ${isHeld ? INTERACTION_ACCENT_COLOR : SETTINGS_TICK_BOX_BORDER_COLOR}`,
          background: isHeld ? INTERACTION_ACCENT_COLOR : "transparent",
          transition: INTERACTION_TRANSITION,
        }}
      >
        {isHeld && (
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
        className="d-flex flex-column flex-fill"
        style={{
          gap: textGapPx,
          minWidth: 0,
        }}
      >
        <span
          className="font-monospace"
          style={{
            fontSize: SETTINGS_TICK_NAME_FONT_SIZE_PX,
            color: isHeld ? SETTINGS_TICK_GRANTED_NAME_COLOR : SETTINGS_TICK_NAME_COLOR,
            overflowWrap: "anywhere",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: SERVER_SCREEN_SAID_FONT_SIZE_PX,
            lineHeight: SERVER_SCREEN_SAID_LINE_HEIGHT,
            color: SERVER_SCREEN_SAID_COLOR,
          }}
        >
          {said}
        </span>
      </span>
    </button>
  );
}
