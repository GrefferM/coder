import { useInteraction } from "../../../../../../hooks";
import { Dot } from "../../../../../../components";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import {
  CHAT_TABS_ACTIVE_COLOR,
  CHAT_TABS_COLOR,
  CHAT_TABS_FONT_SIZE_PX,
  CHAT_TABS_ITEM_PADDING,
  CHAT_TABS_LETTER_SPACING_PX,
  CHAT_TABS_MARK,
  CHAT_TABS_NEWS_COLOR,
  CHAT_TABS_NEWS_GAP_PX,
  CHAT_TABS_NEWS_LABEL,
  CHAT_TABS_NEWS_SIZE_PX,
} from "../../constants";
import type { TabProps } from "./interfaces";

export function Tab({ label, isActive, isNews, onSelect }: TabProps) {
  const { isLit, isFocused, handlers } = useInteraction();

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      {...handlers}
      className="d-flex align-items-center font-monospace text-uppercase"
      style={{
        gap: CHAT_TABS_NEWS_GAP_PX,
        padding: CHAT_TABS_ITEM_PADDING,
        border: "none",
        background: "transparent",
        color: isActive || isLit ? CHAT_TABS_ACTIVE_COLOR : CHAT_TABS_COLOR,
        fontSize: CHAT_TABS_FONT_SIZE_PX,
        fontWeight: isActive ? 500 : undefined,
        letterSpacing: CHAT_TABS_LETTER_SPACING_PX,
        cursor: "pointer",
        outline: "none",
        boxShadow: isActive ? CHAT_TABS_MARK : focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      {label}
      {/* A quiet dot signalling another conversation; no number or word. */}
      {isNews && <Dot color={CHAT_TABS_NEWS_COLOR} size={CHAT_TABS_NEWS_SIZE_PX} label={CHAT_TABS_NEWS_LABEL} />}
    </button>
  );
}
