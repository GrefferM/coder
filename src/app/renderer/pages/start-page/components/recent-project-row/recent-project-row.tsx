import { useInteraction } from "../../../../hooks";
import { useHint } from "../../../../components";
import { Mark } from "../../../../components";
import {
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_TEXT_COLOR,
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_TRANSITION,
} from "../../../../constants";
import { freshLabel } from "../../../../utils/dates";
import { agentsCountLabel } from "../../../../words";
import { RECENT_LABEL_COLOR, START_PAGE_TITLE_COLOR } from "../../constants";
import {
  ROW_BACKGROUND_COLOR,
  ROW_BORDER_COLOR,
  ROW_BORDER_RADIUS_PX,
  ROW_NAME_FONT_SIZE_PX,
  ROW_NOTE_SEPARATOR,
  ROW_NOTE_LETTER_SPACING_PX,
  ROW_PADDING,
  ROW_PATH_COLOR,
  ROW_PATH_FONT_SIZE_PX,
  ROW_TEXT_GAP_PX,
  ROW_FORGET_COLOR,
  ROW_FORGET_LABEL,
  ROW_MISSING_COLOR,
  ROW_MISSING_LABEL,
} from "./constants";
import type { RecentProjectRowProps } from "./interfaces";

/** One recent project row; a row whose folder no longer holds a project is grey and cannot be opened. */
export function RecentProjectRow({ entry, onOpen, onForget }: RecentProjectRowProps) {
  const row = useInteraction();
  const forget = useInteraction();
  // A wordless control says what it is in the app's own window, and never in the browser's `title`.
  const said = useHint<HTMLButtonElement>(ROW_FORGET_LABEL, forget.isLit, forget.isFocused);
  // When this folder was last open, on the app's one scale of freshness — «щойно», «вчора», «12 бер.»
  const opened = freshLabel(new Date(entry.openedAt).getTime(), Date.now());
  const isRowLit = row.isLit && entry.exists;
  const isRowHeld = row.isPressed && entry.exists;

  return (
    <div
      className="d-flex align-items-center w-100"
      style={{
        background: isRowHeld
          ? INTERACTION_PRESSED_BACKGROUND_COLOR
          : isRowLit
            ? INTERACTION_HOVER_BACKGROUND_COLOR
            : ROW_BACKGROUND_COLOR,
        border: `1px solid ${ROW_BORDER_COLOR}`,
        borderRadius: ROW_BORDER_RADIUS_PX,
        transform: isRowHeld ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        transition: INTERACTION_TRANSITION,
      }}
    >
      <button
        type="button"
        disabled={!entry.exists}
        onClick={() => onOpen(entry.directory)}
        {...row.handlers}
        className="d-flex align-items-center justify-content-between flex-fill text-start"
        style={{
          background: "transparent",
          border: "none",
          borderRadius: ROW_BORDER_RADIUS_PX,
          padding: ROW_PADDING,
          cursor: entry.exists ? "pointer" : "default",
          minWidth: 0,
        }}
      >
        <span
          className="d-flex flex-column"
          style={{
            gap: ROW_TEXT_GAP_PX,
          }}
        >
          <span
            style={{
              fontSize: ROW_NAME_FONT_SIZE_PX,
              color: entry.exists ? START_PAGE_TITLE_COLOR : ROW_MISSING_COLOR,
            }}
          >
            {entry.name}
          </span>
          <span
            className="font-monospace"
            style={{
              fontSize: ROW_PATH_FONT_SIZE_PX,
              color: entry.exists ? ROW_PATH_COLOR : ROW_MISSING_COLOR,
            }}
          >
            {entry.exists ? entry.directory : ROW_MISSING_LABEL}
          </span>
        </span>
        {/*
          A recent folder is asked «how fresh is this», so it answers on the scale and not by a date. The scale's
          own words are written small — «щойно», «12 бер.» — because the scale is one and its callers are not, and
          a mono caption line uppercases what it is given.
        */}
        <Mark color={RECENT_LABEL_COLOR} spacing={ROW_NOTE_LETTER_SPACING_PX}>
          {entry.exists ? `${agentsCountLabel(entry.agentCount)}${ROW_NOTE_SEPARATOR}${opened}` : opened}
        </Mark>
      </button>
      <button
        type="button"
        ref={said.ref}
        aria-label={ROW_FORGET_LABEL}
        onClick={() => onForget(entry.directory)}
        {...forget.handlers}
        style={{
          padding: "0 14px",
          alignSelf: "stretch",
          border: "none",
          background: "transparent",
          color: forget.isLit ? INTERACTION_HOVER_TEXT_COLOR : ROW_FORGET_COLOR,
          fontSize: ROW_NAME_FONT_SIZE_PX,
          cursor: "pointer",
          transform: forget.isPressed ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
          transition: INTERACTION_TRANSITION,
        }}
      >
        ✕{said.hint}
      </button>
    </div>
  );
}
