import { useInteraction } from "../../../../../../hooks";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_TRANSITION,
} from "../../../../../../constants";
import {
  SWITCHER_ACTION_FONT_SIZE_PX,
  SWITCHER_ACTION_PADDING,
  SWITCHER_ROW_BORDER_RADIUS_PX,
  SWITCHER_ROW_GAP_PX,
  SWITCHER_ROW_NAME_COLOR,
} from "../../constants";
import type { ListActionProps } from "./interfaces";

/** Action line of the list. */
export function ListAction({
  label,
  onSelect,
  padding = SWITCHER_ACTION_PADDING,
  fontSize = SWITCHER_ACTION_FONT_SIZE_PX,
  color = SWITCHER_ROW_NAME_COLOR,
}: ListActionProps) {
  const { isLit, isPressed, handlers } = useInteraction();

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      {...handlers}
      className="d-flex align-items-center text-start w-100"
      style={{
        padding,
        gap: SWITCHER_ROW_GAP_PX,
        border: "none",
        borderRadius: SWITCHER_ROW_BORDER_RADIUS_PX,
        background: isPressed
          ? INTERACTION_PRESSED_BACKGROUND_COLOR
          : isLit
            ? INTERACTION_HOVER_BACKGROUND_COLOR
            : "transparent",
        color,
        fontSize,
        cursor: "pointer",
        transform: isPressed ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        transition: INTERACTION_TRANSITION,
      }}
    >
      {label}
    </button>
  );
}
