import { useInteraction } from "../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import {
  CHAT_TABS_FRESH_COLOR,
  CHAT_TABS_FRESH_FONT_SIZE_PX,
  CHAT_TABS_FRESH_LABEL,
  CHAT_TABS_FRESH_LETTER_SPACING_PX,
  CHAT_TABS_FRESH_LIT_COLOR,
  CHAT_TABS_ITEM_PADDING,
} from "../../constants";
import type { FreshProps } from "./interfaces";

/** Empties the stream; every question that walked a line stays in the history. */
export function Fresh({ onFresh }: FreshProps) {
  const { isLit, isFocused, handlers } = useInteraction();

  return (
    <button
      type="button"
      onClick={onFresh}
      {...handlers}
      className="ms-auto font-monospace text-uppercase"
      style={{
        padding: CHAT_TABS_ITEM_PADDING,
        border: "none",
        background: "transparent",
        color: isLit ? CHAT_TABS_FRESH_LIT_COLOR : CHAT_TABS_FRESH_COLOR,
        fontSize: CHAT_TABS_FRESH_FONT_SIZE_PX,
        letterSpacing: CHAT_TABS_FRESH_LETTER_SPACING_PX,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      {CHAT_TABS_FRESH_LABEL}
    </button>
  );
}
