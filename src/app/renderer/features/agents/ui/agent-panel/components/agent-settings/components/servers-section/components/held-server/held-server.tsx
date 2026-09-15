import { useInteraction } from "../../../../../../../../../../hooks";
import { heldLabel } from "../../../../../../../../words";
import {
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_REST_BACKGROUND_COLOR,
  INTERACTION_REST_BORDER_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../../../../../constants";
import {
  SETTINGS_ROW_BORDER_RADIUS_PX,
  SETTINGS_ROW_CHEVRON_COLOR,
  SETTINGS_ROW_CHEVRON_SIZE_PX,
  SETTINGS_ROW_GAP_PX,
  SETTINGS_ROW_NAME_COLOR,
  SETTINGS_ROW_NAME_FONT_SIZE_PX,
  SETTINGS_ROW_PADDING,
} from "../../../../constants";
import { HELD_SERVER_COUNT_COLOR, HELD_SERVER_COUNT_LETTER_SPACING_PX, HELD_SERVER_OPEN_LABEL } from "../../constants";
import { focusRing } from "../../../../../../../../../../utils/focus";
import type { HeldServerProps } from "./interfaces";

/**
 * One server this agent is connected to. Connecting and disconnecting are the list's above; the row itself opens
 * what the server hands over, so that a big server can be let in without letting in all of it.
 */
export function HeldServer({ name, held, functions, onOpen }: HeldServerProps) {
  const { isLit, isFocused, handlers } = useInteraction();

  return (
    <button
      type="button"
      aria-label={`${HELD_SERVER_OPEN_LABEL} ${name}`}
      onClick={onOpen}
      {...handlers}
      className="d-flex align-items-center text-start"
      style={{
        padding: SETTINGS_ROW_PADDING,
        gap: SETTINGS_ROW_GAP_PX,
        borderRadius: SETTINGS_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isLit ? INTERACTION_HOVER_BORDER_COLOR : INTERACTION_REST_BORDER_COLOR}`,
        background: INTERACTION_REST_BACKGROUND_COLOR,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      <span
        className="font-monospace flex-fill text-truncate"
        style={{
          color: SETTINGS_ROW_NAME_COLOR,
          fontSize: SETTINGS_ROW_NAME_FONT_SIZE_PX,
        }}
      >
        {name}
      </span>
      <span
        className="font-monospace flex-shrink-0"
        style={{
          color: HELD_SERVER_COUNT_COLOR,
          fontSize: SETTINGS_ROW_NAME_FONT_SIZE_PX,
          letterSpacing: HELD_SERVER_COUNT_LETTER_SPACING_PX,
        }}
      >
        {heldLabel(held, functions)}
      </span>
      <svg
        aria-hidden
        width={SETTINGS_ROW_CHEVRON_SIZE_PX}
        height={SETTINGS_ROW_CHEVRON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={SETTINGS_ROW_CHEVRON_COLOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}
