import { useInteraction } from "../../hooks";
import {
  INTERACTION_ACCENT_COLOR,
  INTERACTION_ACCENT_HOVER_COLOR,
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_TEXT_BACKDROP_MARGIN,
  INTERACTION_TEXT_BACKDROP_PADDING,
  INTERACTION_TEXT_BACKDROP_RADIUS_PX,
  INTERACTION_TRANSITION,
} from "../../constants";
import {
  TEXT_ACTION_DANGER_COLOR,
  TEXT_ACTION_DANGER_HOVER_COLOR,
  TEXT_ACTION_FONT_SIZE_PX,
  TEXT_ACTION_LETTER_SPACING_PX,
  TEXT_ACTION_QUIET_COLOR,
  TEXT_ACTION_QUIET_HOVER_COLOR,
} from "./constants";
import type { TextActionProps } from "./interfaces";
import { focusRing } from "../../utils/focus";

/** Bare text action in a row; the hover backdrop is its click boundary. */
export function TextAction({ label, isDanger = false, isQuiet = false, onClick }: TextActionProps) {
  const { isLit, isFocused, isPressed, handlers } = useInteraction();
  const restColor = isDanger ? TEXT_ACTION_DANGER_COLOR : isQuiet ? TEXT_ACTION_QUIET_COLOR : INTERACTION_ACCENT_COLOR;
  const hoverColor = isDanger
    ? TEXT_ACTION_DANGER_HOVER_COLOR
    : isQuiet
      ? TEXT_ACTION_QUIET_HOVER_COLOR
      : INTERACTION_ACCENT_HOVER_COLOR;

  return (
    <button
      type="button"
      {...handlers}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="font-monospace text-uppercase text-nowrap"
      style={{
        border: "none",
        padding: INTERACTION_TEXT_BACKDROP_PADDING,
        margin: INTERACTION_TEXT_BACKDROP_MARGIN,
        borderRadius: INTERACTION_TEXT_BACKDROP_RADIUS_PX,
        background: isPressed
          ? INTERACTION_PRESSED_BACKGROUND_COLOR
          : isLit
            ? INTERACTION_HOVER_BACKGROUND_COLOR
            : "transparent",
        color: isLit && !isPressed ? hoverColor : restColor,
        fontSize: TEXT_ACTION_FONT_SIZE_PX,
        letterSpacing: TEXT_ACTION_LETTER_SPACING_PX,
        transform: isPressed ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        outline: "none",
        boxShadow: focusRing(isFocused, isDanger),
        transition: INTERACTION_TRANSITION,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
