import { useState } from "react";
import { Dot } from "../../../../../components";
import { useWindowDismiss } from "../../../../../hooks";
import {
  MARK_WINDOW_BACKGROUND_COLOR,
  MARK_WINDOW_BORDER_COLOR,
  MARK_WINDOW_CHOSEN_BACKGROUND,
  MARK_WINDOW_CHOSEN_COLOR,
  MARK_WINDOW_CHOSEN_STRIPE_PX,
  MARK_WINDOW_DOT_SIZE_PX,
  MARK_WINDOW_FONT_SIZE_PX,
  MARK_WINDOW_GAP_PX,
  MARK_WINDOW_HEAD_COLOR,
  MARK_WINDOW_HEAD_PADDING,
  MARK_WINDOW_LETTER_SPACING_PX,
  MARK_WINDOW_NAME_COLOR,
  MARK_WINDOW_RADIUS_PX,
  MARK_WINDOW_ROWS_SHOWN,
  MARK_WINDOW_ROW_HEIGHT_PX,
  MARK_WINDOW_ROW_PADDING,
  MARK_WINDOW_SHADOW,
  MARK_WINDOW_SMALL_FONT_SIZE_PX,
  MARK_WINDOW_WIDTH_PX,
} from "./constants";
import type { MarkWindowProps } from "./interfaces";

/**
 * What a mark of the arc says under the pointer. Over a «+» it lists only what is folded; over a mark of its own, that
 * one name. A line leads to its source's page and shuts the window. Bound to the mark, so any canvas move closes it; no
 * key row.
 */
export function MarkWindow({ at, head, rows, onOpen, onDismiss, onHold }: MarkWindowProps) {
  const [chosen, setChosen] = useState(0);
  // Opens above the mark, or below when there is no room; the canvas itself does not move.
  const isAbove = at.top > window.innerHeight - at.bottom;

  /** Not counted among the windows over the app: it would take Escape, which belongs to the side panel. */
  useWindowDismiss(true, onDismiss, "click", false);

  return (
    <div
      role="listbox"
      tabIndex={-1}
      aria-label={head}
      onPointerEnter={() => onHold(true)}
      onPointerLeave={() => onHold(false)}
      className="d-flex flex-column"
      style={{
        position: "fixed",
        left: at.left + at.width / 2,
        ...(isAbove
          ? {
              bottom: window.innerHeight - at.top + MARK_WINDOW_GAP_PX,
            }
          : {
              top: at.bottom + MARK_WINDOW_GAP_PX,
            }),
        transform: "translateX(-50%)",
        width: MARK_WINDOW_WIDTH_PX,
        borderRadius: MARK_WINDOW_RADIUS_PX,
        border: `1px solid ${MARK_WINDOW_BORDER_COLOR}`,
        background: MARK_WINDOW_BACKGROUND_COLOR,
        boxShadow: MARK_WINDOW_SHADOW,
        outline: "none",
        zIndex: 1,
      }}
    >
      <div
        className="font-monospace text-uppercase"
        style={{
          padding: MARK_WINDOW_HEAD_PADDING,
          borderBottom: `1px solid ${MARK_WINDOW_BORDER_COLOR}`,
          color: MARK_WINDOW_HEAD_COLOR,
          fontSize: MARK_WINDOW_SMALL_FONT_SIZE_PX,
          letterSpacing: MARK_WINDOW_LETTER_SPACING_PX,
        }}
      >
        {head}
      </div>

      <div
        className="d-flex flex-column"
        style={{
          maxHeight: MARK_WINDOW_ROWS_SHOWN * MARK_WINDOW_ROW_HEIGHT_PX,
          overflowY: "auto",
        }}
      >
        {rows.map((row, at2) => (
          <button
            key={`${row.group}-${row.grantId ?? ""}`}
            type="button"
            role="option"
            aria-selected={at2 === chosen}
            className="d-flex align-items-center font-monospace text-start"
            onPointerEnter={() => setChosen(at2)}
            onClick={() => onOpen(row)}
            style={{
              flex: "0 0 auto",
              height: MARK_WINDOW_ROW_HEIGHT_PX,
              gap: MARK_WINDOW_GAP_PX,
              padding: MARK_WINDOW_ROW_PADDING,
              border: "none",
              borderLeft: `${MARK_WINDOW_CHOSEN_STRIPE_PX}px solid ${at2 === chosen ? MARK_WINDOW_CHOSEN_COLOR : "transparent"}`,
              background: at2 === chosen ? MARK_WINDOW_CHOSEN_BACKGROUND : "transparent",
              color: MARK_WINDOW_NAME_COLOR,
              fontSize: MARK_WINDOW_FONT_SIZE_PX,
              cursor: "pointer",
            }}
          >
            <Dot color={row.color} size={MARK_WINDOW_DOT_SIZE_PX} />
            {/* The name alone, at full width. */}
            <span className="flex-fill text-truncate">{row.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
