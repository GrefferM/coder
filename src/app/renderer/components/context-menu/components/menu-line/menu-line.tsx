import { useInteraction } from "../../../../hooks";
import { walkRing } from "../../../../utils/focus";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_TRANSITION,
} from "../../../../constants";
import {
  CONTEXT_MENU_DANGER_COLOR,
  CONTEXT_MENU_DANGER_HOVER_BACKGROUND_COLOR,
  CONTEXT_MENU_DANGER_HOVER_COLOR,
  CONTEXT_MENU_DANGER_PRESSED_BACKGROUND_COLOR,
  CONTEXT_MENU_DISABLED_COLOR,
  CONTEXT_MENU_ITEM_BORDER_RADIUS_PX,
  CONTEXT_MENU_ITEM_COLOR,
  CONTEXT_MENU_ITEM_FONT_SIZE_PX,
  CONTEXT_MENU_ITEM_GAP_PX,
  CONTEXT_MENU_ITEM_HEIGHT_PX,
  CONTEXT_MENU_ITEM_PADDING,
  CONTEXT_MENU_SHORTCUT_COLOR,
  CONTEXT_MENU_SHORTCUT_DISABLED_COLOR,
  CONTEXT_MENU_SHORTCUT_FONT_SIZE_PX,
} from "../../constants";
import type { MenuLineProps } from "./interfaces";

/** One menu line: lit on hover, darker and shifted 1px down when pressed. */
export function MenuLine({ item, isWalked, onWalk }: MenuLineProps) {
  const { isLit, isPressed, handlers } = useInteraction();
  const isHeld = isPressed && !item.isDisabled;
  const isBright = isLit && !item.isDisabled;

  function color() {
    if (item.isDisabled) {
      return CONTEXT_MENU_DISABLED_COLOR;
    }

    if (!item.isDanger) {
      return CONTEXT_MENU_ITEM_COLOR;
    }

    return isBright || isHeld ? CONTEXT_MENU_DANGER_HOVER_COLOR : CONTEXT_MENU_DANGER_COLOR;
  }

  function background() {
    if (isHeld) {
      return item.isDanger ? CONTEXT_MENU_DANGER_PRESSED_BACKGROUND_COLOR : INTERACTION_PRESSED_BACKGROUND_COLOR;
    }

    if (!isBright) {
      return "transparent";
    }

    return item.isDanger ? CONTEXT_MENU_DANGER_HOVER_BACKGROUND_COLOR : INTERACTION_HOVER_BACKGROUND_COLOR;
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.isDisabled}
      className="d-flex align-items-center text-start"
      onClick={item.onSelect}
      {...handlers}
      onMouseEnter={() => {
        handlers.onMouseEnter();
        onWalk();
      }}
      style={{
        height: CONTEXT_MENU_ITEM_HEIGHT_PX,
        gap: CONTEXT_MENU_ITEM_GAP_PX,
        border: "none",
        borderRadius: CONTEXT_MENU_ITEM_BORDER_RADIUS_PX,
        padding: CONTEXT_MENU_ITEM_PADDING,
        fontSize: CONTEXT_MENU_ITEM_FONT_SIZE_PX,
        color: color(),
        background: background(),
        cursor: item.isDisabled ? "default" : "pointer",
        boxShadow: walkRing(isWalked),
        transform: isHeld ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        transition: INTERACTION_TRANSITION,
      }}
    >
      {item.icon}
      {item.label}
      {item.shortcut !== undefined && (
        <span
          className="ms-auto font-monospace"
          style={{
            fontSize: CONTEXT_MENU_SHORTCUT_FONT_SIZE_PX,
            color: item.isDisabled ? CONTEXT_MENU_SHORTCUT_DISABLED_COLOR : CONTEXT_MENU_SHORTCUT_COLOR,
          }}
        >
          {item.shortcut}
        </span>
      )}
    </button>
  );
}
