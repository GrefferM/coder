import { useInteraction } from "../../../../hooks";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_TEXT_COLOR,
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_TRANSITION,
} from "../../../../constants";
import {
  ZOOM_TOOLBAR_BUTTON_BORDER_RADIUS_PX,
  ZOOM_TOOLBAR_BUTTON_SIZE_PX,
  ZOOM_TOOLBAR_COLOR,
  ZOOM_TOOLBAR_DISABLED_OPACITY,
  ZOOM_TOOLBAR_FONT_SIZE_PX,
} from "../../constants";
import type { ZoomButtonProps } from "./interfaces";

/** One zoom step; dimmed at the scale's end. */
export function ZoomButton({ label, isDisabled, onSelect }: ZoomButtonProps) {
  const { isLit, isPressed, handlers } = useInteraction();
  const isHeld = isPressed && !isDisabled;
  const isBright = isLit && !isDisabled;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={isDisabled}
      onClick={onSelect}
      {...handlers}
      className="d-flex align-items-center justify-content-center font-monospace"
      style={{
        width: ZOOM_TOOLBAR_BUTTON_SIZE_PX,
        height: ZOOM_TOOLBAR_BUTTON_SIZE_PX,
        border: "none",
        borderRadius: ZOOM_TOOLBAR_BUTTON_BORDER_RADIUS_PX,
        background: isHeld
          ? INTERACTION_PRESSED_BACKGROUND_COLOR
          : isBright
            ? INTERACTION_HOVER_BACKGROUND_COLOR
            : "transparent",
        color: isBright || isHeld ? INTERACTION_HOVER_TEXT_COLOR : ZOOM_TOOLBAR_COLOR,
        fontSize: ZOOM_TOOLBAR_FONT_SIZE_PX,
        opacity: isDisabled ? ZOOM_TOOLBAR_DISABLED_OPACITY : 1,
        cursor: isDisabled ? "default" : "pointer",
        transform: isHeld ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        transition: INTERACTION_TRANSITION,
      }}
    >
      {label}
    </button>
  );
}
