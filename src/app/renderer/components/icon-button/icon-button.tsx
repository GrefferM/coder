import { useInteraction } from "../../hooks";
import { FIRST_LEVEL_TEXT_COLOR, INTERACTION_TRANSITION, SECOND_LEVEL_TEXT_COLOR } from "../../constants";
import { focusRing } from "../../utils/focus";
import type { IconButtonProps, IconTone } from "./interfaces";

const QUIET_TONE: IconTone = {
  rest: SECOND_LEVEL_TEXT_COLOR,
  lit: FIRST_LEVEL_TEXT_COLOR,
};

/** A bare glyph button: no box, lit under the pointer, ringed under the keyboard. */
export function IconButton({ label, onPress, children, tone = QUIET_TONE, isDisabled = false }: IconButtonProps) {
  const press = useInteraction();
  const color = isDisabled ? (tone.dead ?? tone.rest) : press.isLit ? tone.lit : tone.rest;

  return (
    <button
      type="button"
      onClick={onPress}
      {...press.handlers}
      disabled={isDisabled}
      aria-label={label}
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        padding: 0,
        border: "none",
        background: "transparent",
        color,
        cursor: isDisabled ? "default" : "pointer",
        outline: "none",
        boxShadow: focusRing(press.isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      {children}
    </button>
  );
}
