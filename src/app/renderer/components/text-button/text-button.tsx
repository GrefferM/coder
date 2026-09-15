import { useInteraction } from "../../hooks";
import { INTERACTION_TRANSITION, MARK_FONT_SIZE_PX, MARK_LETTER_SPACING_PX } from "../../constants";
import { focusRing } from "../../utils/focus";
import type { TextButtonProps } from "./interfaces";

/** A bare mark that is a button — no box, lit under the pointer, a ring under the keyboard. */
export function TextButton({ children, onPress, tone, gap, className }: TextButtonProps) {
  const press = useInteraction();

  return (
    <button
      type="button"
      onClick={onPress}
      {...press.handlers}
      className={`d-flex align-items-center font-monospace text-uppercase${className === undefined ? "" : ` ${className}`}`}
      style={{
        gap,
        padding: 0,
        border: "none",
        background: "transparent",
        color: press.isLit ? tone.lit : tone.rest,
        fontSize: MARK_FONT_SIZE_PX,
        letterSpacing: MARK_LETTER_SPACING_PX,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(press.isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      {children}
    </button>
  );
}
