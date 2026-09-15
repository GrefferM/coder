import { useInteraction } from "../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import {
  CHAT_TABS_FORGET_LIT_COLOR,
  CHAT_TABS_FORGET_PREFIX,
  CHAT_TABS_FORGET_SPENT_COLOR,
  CHAT_TABS_FRESH_COLOR,
  CHAT_TABS_FRESH_FONT_SIZE_PX,
  CHAT_TABS_FRESH_LETTER_SPACING_PX,
  CHAT_TABS_ITEM_PADDING,
} from "../../constants";
import type { ForgetAllProps } from "./interfaces";

/** The history's own act, in the place the stream keeps for its own — and it destroys. */
export function ForgetAll({ runs, onForgetAll }: ForgetAllProps) {
  const { isLit, isFocused, handlers } = useInteraction();
  const isSpent = runs === 0;

  return (
    <button
      type="button"
      disabled={isSpent}
      onClick={onForgetAll}
      {...handlers}
      className="ms-auto font-monospace text-uppercase"
      style={{
        padding: CHAT_TABS_ITEM_PADDING,
        border: "none",
        background: "transparent",
        color: isSpent ? CHAT_TABS_FORGET_SPENT_COLOR : isLit ? CHAT_TABS_FORGET_LIT_COLOR : CHAT_TABS_FRESH_COLOR,
        fontSize: CHAT_TABS_FRESH_FONT_SIZE_PX,
        letterSpacing: CHAT_TABS_FRESH_LETTER_SPACING_PX,
        cursor: isSpent ? "default" : "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      {`${CHAT_TABS_FORGET_PREFIX}${runs}`}
    </button>
  );
}
