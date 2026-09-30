import { useInteraction } from "../../../../../../hooks";
import { useHint } from "../../../../../../components";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_REST_BACKGROUND_COLOR,
  INTERACTION_REST_BORDER_COLOR,
  INTERACTION_TRANSITION,
} from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import { newsLabel } from "../../../../words";
import {
  AGENT_CHAT_TO_BOTTOM_BOTTOM_PX,
  AGENT_CHAT_TO_BOTTOM_ICON_COLOR,
  AGENT_CHAT_TO_BOTTOM_ICON_PATH,
  AGENT_CHAT_TO_BOTTOM_ICON_SIZE_PX,
  AGENT_CHAT_TO_BOTTOM_ICON_STROKE,
  AGENT_CHAT_TO_BOTTOM_LABEL,
  AGENT_CHAT_TO_BOTTOM_NEWS_BORDER_COLOR,
  AGENT_CHAT_TO_BOTTOM_NEWS_COLOR,
  AGENT_CHAT_TO_BOTTOM_NEWS_FONT_SIZE_PX,
  AGENT_CHAT_TO_BOTTOM_NEWS_GAP_PX,
  AGENT_CHAT_TO_BOTTOM_NEWS_LETTER_SPACING_PX,
  AGENT_CHAT_TO_BOTTOM_NEWS_PADDING,
  AGENT_CHAT_TO_BOTTOM_RIGHT_PX,
  AGENT_CHAT_TO_BOTTOM_SHADOW,
  AGENT_CHAT_TO_BOTTOM_SIZE_PX,
} from "../../constants";
import type { ToBottomProps } from "./interfaces";

/**
 * The button down: at the right edge above the field so it never covers the last reply; news turns the arrow into a
 * pill with a number.
 */
export function ToBottom({ news, onGo }: ToBottomProps) {
  const { isLit, isFocused, handlers } = useInteraction();
  const said = useHint<HTMLButtonElement>(AGENT_CHAT_TO_BOTTOM_LABEL, isLit, isFocused);
  const hasNews = news > 0;

  return (
    <button
      ref={said.ref}
      type="button"
      aria-label={AGENT_CHAT_TO_BOTTOM_LABEL}
      onClick={onGo}
      {...handlers}
      className="position-absolute d-flex align-items-center justify-content-center"
      style={{
        right: AGENT_CHAT_TO_BOTTOM_RIGHT_PX,
        bottom: AGENT_CHAT_TO_BOTTOM_BOTTOM_PX,
        height: AGENT_CHAT_TO_BOTTOM_SIZE_PX,
        width: hasNews ? undefined : AGENT_CHAT_TO_BOTTOM_SIZE_PX,
        gap: hasNews ? AGENT_CHAT_TO_BOTTOM_NEWS_GAP_PX : undefined,
        padding: hasNews ? AGENT_CHAT_TO_BOTTOM_NEWS_PADDING : 0,
        borderRadius: AGENT_CHAT_TO_BOTTOM_SIZE_PX / 2,
        background: isLit ? INTERACTION_HOVER_BACKGROUND_COLOR : INTERACTION_REST_BACKGROUND_COLOR,
        border: `1px solid ${
          hasNews
            ? AGENT_CHAT_TO_BOTTOM_NEWS_BORDER_COLOR
            : isLit || isFocused
              ? INTERACTION_HOVER_BORDER_COLOR
              : INTERACTION_REST_BORDER_COLOR
        }`,
        boxShadow: isFocused ? focusRing(true) : AGENT_CHAT_TO_BOTTOM_SHADOW,
        cursor: "pointer",
        outline: "none",
        transition: INTERACTION_TRANSITION,
      }}
    >
      <svg
        width={AGENT_CHAT_TO_BOTTOM_ICON_SIZE_PX}
        height={AGENT_CHAT_TO_BOTTOM_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={hasNews ? AGENT_CHAT_TO_BOTTOM_NEWS_COLOR : AGENT_CHAT_TO_BOTTOM_ICON_COLOR}
        strokeWidth={AGENT_CHAT_TO_BOTTOM_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
        aria-hidden
      >
        <path d={AGENT_CHAT_TO_BOTTOM_ICON_PATH} />
      </svg>
      {hasNews && (
        <span
          className="font-monospace"
          style={{
            color: AGENT_CHAT_TO_BOTTOM_NEWS_COLOR,
            fontSize: AGENT_CHAT_TO_BOTTOM_NEWS_FONT_SIZE_PX,
            letterSpacing: AGENT_CHAT_TO_BOTTOM_NEWS_LETTER_SPACING_PX,
          }}
        >
          {newsLabel(news)}
        </span>
      )}
      {said.hint}
    </button>
  );
}
