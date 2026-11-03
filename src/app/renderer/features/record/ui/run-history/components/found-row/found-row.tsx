import { FoundWords, useHint } from "../../../../../../components";
import { useInteraction } from "../../../../../../hooks";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import { foundStanding } from "../../../../logic";
import { foundAddress } from "../../../../words";
import { timeLabel } from "../../../../../../utils/dates";

import {
  RUN_HISTORY_ASKED_COLOR,
  RUN_HISTORY_ASKED_FONT_SIZE_PX,
  RUN_HISTORY_ASKED_LINES,
  RUN_HISTORY_ASKED_LINE_HEIGHT,
  RUN_HISTORY_GONE_NAME_COLOR,
  RUN_HISTORY_HEAD_GAP_PX,
  RUN_HISTORY_OPEN_HINT,
  RUN_HISTORY_QUIET_COLOR,
  RUN_HISTORY_QUIET_FONT_SIZE_PX,
  RUN_HISTORY_QUIET_LETTER_SPACING_PX,
  RUN_HISTORY_ROW_BACKGROUND_COLOR,
  RUN_HISTORY_ROW_BORDER_COLOR,
  RUN_HISTORY_ROW_BORDER_RADIUS_PX,
  RUN_HISTORY_ROW_GAP_PX,
  RUN_HISTORY_ROW_LIT_BACKGROUND_COLOR,
  RUN_HISTORY_ROW_LIT_BORDER_COLOR,
  RUN_HISTORY_ROW_PADDING,
  RUN_SEARCH_CALL_FONT,
} from "../../constants";
import type { FoundRowProps } from "./interfaces";

/** One place the word was found; no flow facts or forget cross, as one flow can have many places. */
export function FoundRow({ agents, found, looked, onOpen }: FoundRowProps) {
  const { isLit, isFocused, handlers } = useInteraction();
  // The hint shows in the app's own window, not the browser `title`.
  const hinted = useHint<HTMLButtonElement>(RUN_HISTORY_OPEN_HINT, isLit, isFocused);
  const said = foundStanding(found, agents);
  const address = foundAddress(found.step, timeLabel(found.at));

  return (
    <button
      ref={hinted.ref}
      type="button"
      aria-label={RUN_HISTORY_OPEN_HINT}
      onClick={onOpen}
      {...handlers}
      className="d-flex flex-column w-100 text-start"
      style={{
        gap: RUN_HISTORY_ROW_GAP_PX,
        padding: RUN_HISTORY_ROW_PADDING,
        borderRadius: RUN_HISTORY_ROW_BORDER_RADIUS_PX,
        border: `1px solid ${isLit || isFocused ? RUN_HISTORY_ROW_LIT_BORDER_COLOR : RUN_HISTORY_ROW_BORDER_COLOR}`,
        background: isLit ? RUN_HISTORY_ROW_LIT_BACKGROUND_COLOR : RUN_HISTORY_ROW_BACKGROUND_COLOR,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      {/* The address of this message: the agent in its colour (quiet if gone) and where in the walk it was said. */}
      <span
        className="d-flex align-items-center w-100 font-monospace"
        style={{
          gap: RUN_HISTORY_HEAD_GAP_PX,
          fontSize: RUN_HISTORY_QUIET_FONT_SIZE_PX,
          letterSpacing: RUN_HISTORY_QUIET_LETTER_SPACING_PX,
        }}
      >
        <span
          className="text-truncate"
          style={{
            color: said.color ?? RUN_HISTORY_GONE_NAME_COLOR,
          }}
        >
          {said.name}
        </span>
        <span className="flex-fill" />
        <span
          className="flex-shrink-0"
          style={{
            color: RUN_HISTORY_QUIET_COLOR,
          }}
        >
          {address}
        </span>
      </span>
      <span
        style={{
          display: "-webkit-box",
          WebkitLineClamp: RUN_HISTORY_ASKED_LINES,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          color: RUN_HISTORY_ASKED_COLOR,
          fontSize: RUN_HISTORY_ASKED_FONT_SIZE_PX,
          lineHeight: RUN_HISTORY_ASKED_LINE_HEIGHT,
          fontFamily: found.isCall ? RUN_SEARCH_CALL_FONT : undefined,
          overflowWrap: "anywhere",
        }}
      >
        <FoundWords words={found.found} looked={looked} />
      </span>
      {hinted.hint}
    </button>
  );
}
