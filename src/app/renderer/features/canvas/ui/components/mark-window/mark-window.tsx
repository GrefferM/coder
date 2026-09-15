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
 * What a mark of the arc says under the pointer. Over a «+» it holds **only what is folded** — the marks that
 * kept their places are already under the hand; over a mark of its own it holds that one name, because a
 * mini-sphere that says nothing under the cursor has to be pressed to be read.
 *
 * A line leads where its own mark would have led, straight to that source's page, and the window shuts behind
 * it: it was a road and not a place. It is bound to the mark rather than to the screen, so any move of the
 * canvas puts it away.
 *
 * It is kept small — it stands beside a sphere, not over a panel — and carries no row of keys along its bottom:
 * the scene answers the hand, the panel's fields answer the keyboard.
 *
 * It opens on the **pointer** and not on a press: a list you have to click open to find out what is behind a «+»
 * is a list you open twice. The press still chooses a line, and the window says when it holds the hand, so
 * leaving the mark does not snatch it away mid-reach.
 *
 * No count stands beside a server's name: a name cut short for a number is a worse line than one without it.
 */
export function MarkWindow({ at, head, rows, onOpen, onDismiss, onHold }: MarkWindowProps) {
  const [chosen, setChosen] = useState(0);
  // «вгору, а при браку місця — вниз»; the canvas itself does not move — the hand pulls it, not it the hand.
  const isAbove = at.top > window.innerHeight - at.bottom;

  /**
   * It is not one of the things that stand **over** the app: it came from the pointer resting somewhere and it
   * goes when the pointer leaves. Counting it among them would put Escape in its hands, and Escape has one word
   * on this page — it puts the side panel away — which a window nobody asked to open must not take.
   */
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
            {/* The name and nothing else: it is what the line is, and it takes the whole width to say it. */}
            <span className="flex-fill text-truncate">{row.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
