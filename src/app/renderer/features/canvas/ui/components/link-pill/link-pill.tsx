import { TextButton } from "../../../../../components";
import { DeleteAgentIcon } from "../menu-icons";
import {
  LINK_PILL_ARROW_COLOR,
  LINK_PILL_ARROW_HEIGHT_PX,
  LINK_PILL_ARROW_POINTS,
  LINK_PILL_ARROW_VIEW_BOX,
  LINK_PILL_ARROW_WIDTH,
  LINK_PILL_ARROW_WIDTH_PX,
  LINK_PILL_BACKGROUND_COLOR,
  LINK_PILL_BORDER_COLOR,
  LINK_PILL_BORDER_RADIUS_PX,
  LINK_PILL_DELETE_COLOR,
  LINK_PILL_DELETE_GAP_PX,
  LINK_PILL_DELETE_ICON_SIZE_PX,
  LINK_PILL_DELETE_LABEL,
  LINK_PILL_DELETE_SHORTCUT,
  LINK_PILL_DIVIDER_COLOR,
  LINK_PILL_DIVIDER_HEIGHT_PX,
  LINK_PILL_FONT_SIZE_PX,
  LINK_PILL_GAP_PX,
  LINK_PILL_LETTER_SPACING_PX,
  LINK_PILL_NAME_GAP_PX,
  LINK_PILL_OFFSET_Y_PX,
  LINK_PILL_PADDING,
  LINK_PILL_SHADOW,
} from "./constants";
import type { LinkPillProps } from "./interfaces";

/** Chosen link's pill — direction and `⌫ Видалити`; the canvas listens for the same keystroke. */
export function LinkPill({ from, to, at, onDelete }: LinkPillProps) {
  return (
    <div
      className="d-flex align-items-center"
      // The canvas behind the pill clears the choice on click.
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      role="presentation"
      style={{
        position: "absolute",
        left: at.x,
        top: at.y - LINK_PILL_OFFSET_Y_PX,
        transform: "translate(-50%, -100%)",
        gap: LINK_PILL_GAP_PX,
        padding: LINK_PILL_PADDING,
        borderRadius: LINK_PILL_BORDER_RADIUS_PX,
        border: `1px solid ${LINK_PILL_BORDER_COLOR}`,
        background: LINK_PILL_BACKGROUND_COLOR,
        boxShadow: LINK_PILL_SHADOW,
        whiteSpace: "nowrap",
        // The layer it stands in passes the pointer through; the pill must take it.
        pointerEvents: "auto",
      }}
    >
      <span
        className="d-flex align-items-center font-monospace text-uppercase"
        style={{
          gap: LINK_PILL_NAME_GAP_PX,
          fontSize: LINK_PILL_FONT_SIZE_PX,
          letterSpacing: LINK_PILL_LETTER_SPACING_PX,
        }}
      >
        <span
          style={{
            color: from.color,
          }}
        >
          {from.name}
        </span>
        <svg width={LINK_PILL_ARROW_WIDTH_PX} height={LINK_PILL_ARROW_HEIGHT_PX} viewBox={LINK_PILL_ARROW_VIEW_BOX}>
          <line x1="0" y1="3" x2="20" y2="3" stroke={LINK_PILL_ARROW_COLOR} strokeWidth={LINK_PILL_ARROW_WIDTH} />
          <polygon points={LINK_PILL_ARROW_POINTS} fill={LINK_PILL_ARROW_COLOR} />
        </svg>
        <span
          style={{
            color: to.color,
          }}
        >
          {to.name}
        </span>
      </span>
      <span
        style={{
          width: 1,
          height: LINK_PILL_DIVIDER_HEIGHT_PX,
          background: LINK_PILL_DIVIDER_COLOR,
        }}
      />
      <TextButton
        tone={{
          rest: LINK_PILL_DELETE_COLOR,
          lit: LINK_PILL_DELETE_COLOR,
        }}
        gap={LINK_PILL_DELETE_GAP_PX}
        onPress={onDelete}
      >
        <DeleteAgentIcon sizePx={LINK_PILL_DELETE_ICON_SIZE_PX} />
        {`${LINK_PILL_DELETE_SHORTCUT} ${LINK_PILL_DELETE_LABEL}`}
      </TextButton>
    </div>
  );
}
