import { useInteraction } from "../../hooks";
import { INTERACTION_TRANSITION } from "../../constants";
import {
  BOXED_ACTION_BORDER_COLOR,
  BOXED_ACTION_BORDER_RADIUS_PX,
  BOXED_ACTION_COLOR,
  BOXED_ACTION_FONT_SIZE_PX,
  BOXED_ACTION_LETTER_SPACING_PX,
  BOXED_ACTION_LIT_BACKGROUND_COLOR,
  BOXED_ACTION_PADDING,
} from "./constants";
import type { BoxedActionProps } from "./interfaces";

/** A plain action in its own box — «СКАСУВАТИ», «ПЕРЕПИТАТИ», «ПЕРЕЗАПУСТИТИ»; its press stops here. */
export function BoxedAction({ label, onPress }: BoxedActionProps) {
  const { isLit, handlers } = useInteraction();

  return (
    <button
      type="button"
      {...handlers}
      onClick={(press) => {
        press.stopPropagation();
        onPress();
      }}
      className="font-monospace text-uppercase flex-shrink-0"
      style={{
        padding: BOXED_ACTION_PADDING,
        borderRadius: BOXED_ACTION_BORDER_RADIUS_PX,
        border: `1px solid ${BOXED_ACTION_BORDER_COLOR}`,
        background: isLit ? BOXED_ACTION_LIT_BACKGROUND_COLOR : "transparent",
        color: BOXED_ACTION_COLOR,
        fontSize: BOXED_ACTION_FONT_SIZE_PX,
        letterSpacing: BOXED_ACTION_LETTER_SPACING_PX,
        outline: "none",
        transition: INTERACTION_TRANSITION,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
