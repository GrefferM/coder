import { useInteraction } from "../../hooks";
import { INTERACTION_FOCUS_RING_PX, INTERACTION_PRESSED_SHIFT_PX, INTERACTION_TRANSITION } from "../../constants";
import {
  ACTION_BUTTON_BORDER_RADIUS_PX,
  ACTION_BUTTON_DISABLED_OPACITY,
  ACTION_BUTTON_FONT_SIZE_PX,
  ACTION_BUTTON_FONT_WEIGHT,
  ACTION_BUTTON_PADDING,
  ACTION_BUTTON_PALETTES,
} from "./constants";
import type { ActionButtonProps } from "./interfaces";

/** A dimmed button keeps focus and ignores presses (`aria-disabled`, not `disabled`). */
export function ActionButton({ variant, label, type = "button", ref, onClick, isDisabled = false }: ActionButtonProps) {
  const { isPressed, isFocused, isLit, handlers } = useInteraction();
  const palette = ACTION_BUTTON_PALETTES[variant];
  const isHeld = isPressed && !isDisabled;
  const isBright = isLit && !isHeld && !isDisabled;

  return (
    <button
      ref={ref}
      type={type}
      /** Lets the tab's footer walk put the writing action first. */
      data-action={variant}
      aria-disabled={isDisabled || undefined}
      onClick={(event) => {
        // A dimmed button ignores pointer, Enter and form submission.
        if (isDisabled) {
          event.preventDefault();

          return;
        }

        onClick?.();
      }}
      {...handlers}
      className="flex-fill text-center"
      style={{
        padding: ACTION_BUTTON_PADDING,
        borderRadius: ACTION_BUTTON_BORDER_RADIUS_PX,
        border: `1px solid ${isHeld ? palette.pressedBorderColor : isBright ? palette.litBorderColor : palette.borderColor}`,
        background: isHeld ? palette.pressedBackground : isBright ? palette.litBackground : palette.background,
        color: isHeld ? palette.pressedColor : isBright ? palette.litColor : palette.color,
        fontSize: ACTION_BUTTON_FONT_SIZE_PX,
        fontWeight: ACTION_BUTTON_FONT_WEIGHT,
        opacity: isDisabled ? ACTION_BUTTON_DISABLED_OPACITY : 1,
        cursor: isDisabled ? "default" : "pointer",
        transform: isHeld ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        outline: "none",
        boxShadow: isFocused ? `0 0 0 ${INTERACTION_FOCUS_RING_PX}px ${palette.focusRingColor}` : undefined,
        transition: INTERACTION_TRANSITION,
      }}
    >
      {label}
    </button>
  );
}
