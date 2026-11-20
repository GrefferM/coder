import {
  WIDGET_BORDER_COLOR,
  WIDGET_CARD_BACKGROUND_COLOR,
  WIDGET_CARD_BORDER_RADIUS_PX,
  WIDGET_CARD_PADDING_PX,
  WIDGET_CARD_UNDER_GAP_PX,
  WIDGET_TEXT_FONT_SIZE_PX,
  WIDGET_TEXT_LINE_HEIGHT,
} from "../../constants";
import type { TextCardProps } from "../../interfaces";

/**
 * Words on a card of their own, selectable: the person's question, with the recordings it was said with under it, or
 * an end of the walk.
 */
export function TextCard({ text, color, children }: TextCardProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: WIDGET_CARD_UNDER_GAP_PX,
        padding: WIDGET_CARD_PADDING_PX,
        borderRadius: WIDGET_CARD_BORDER_RADIUS_PX,
        border: `1px solid ${WIDGET_BORDER_COLOR}`,
        background: WIDGET_CARD_BACKGROUND_COLOR,
        color,
        fontSize: WIDGET_TEXT_FONT_SIZE_PX,
        lineHeight: WIDGET_TEXT_LINE_HEIGHT,
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
      }}
    >
      <span
        style={{
          userSelect: "text",
        }}
      >
        {text}
      </span>
      {children}
    </div>
  );
}
