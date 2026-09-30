import { useState } from "react";
import { lastCallLine } from "../../../../../../words";
import { timeLabel } from "../../../../../../../../utils/dates";
import {
  SERVER_CALL_LOST_LABEL,
  SERVER_FACTS_SEPARATOR,
  SERVER_FELL_COLOR,
  SERVER_LAST_CALL_FELL_LABEL,
  SERVER_LAST_CALL_LABEL,
  SERVER_SHOW_CALL_LABEL,
} from "../../../../../../constants";
import { TextAction } from "../../../../../../../../components";
import { SERVER_ROW_FACTS_COLOR } from "../../constants";
import {
  LAST_CALL_BORDER_RADIUS_PX,
  LAST_CALL_GAP_PX,
  LAST_CALL_LABEL_FONT_SIZE_PX,
  LAST_CALL_LABEL_LETTER_SPACING_PX,
  LAST_CALL_PADDING,
  LAST_CALL_QUIET_BACKGROUND_COLOR,
  LAST_CALL_QUIET_BORDER_COLOR,
  LAST_CALL_SAID_COLOR,
  LAST_CALL_SAID_FONT_SIZE_PX,
  LAST_CALL_SAID_LINE_HEIGHT,
  LAST_CALL_SAID_LINES,
  LAST_CALL_SIGN_SIZE_PX,
  LAST_CALL_SIGN_TOP_PX,
  LAST_CALL_SIGN_WIDTH,
  LAST_CALL_TEXT_GAP_PX,
  LAST_CALL_TROUBLE_BACKGROUND_COLOR,
  LAST_CALL_TROUBLE_BORDER_COLOR,
} from "./constants";
import type { LastCallProps } from "./interfaces";

/**
 * What the last call to this server came to: a stripe on a whole row, or the block under a row that says no function
 * answered. The body is the same in both.
 */
export function LastCall({ failure, isNews, onShow }: LastCallProps) {
  const label = isNews ? SERVER_LAST_CALL_FELL_LABEL : SERVER_LAST_CALL_LABEL;
  /**
   * Whether the way was tried and led nowhere; the word replaces the press, since a second press would find nothing
   * either.
   */
  const [isLost, setIsLost] = useState(false);

  return (
    <div
      className="d-flex align-items-start"
      style={{
        gap: LAST_CALL_GAP_PX,
        padding: LAST_CALL_PADDING,
        borderRadius: LAST_CALL_BORDER_RADIUS_PX,
        background: isNews ? LAST_CALL_TROUBLE_BACKGROUND_COLOR : LAST_CALL_QUIET_BACKGROUND_COLOR,
        border: `1px solid ${isNews ? LAST_CALL_TROUBLE_BORDER_COLOR : LAST_CALL_QUIET_BORDER_COLOR}`,
      }}
    >
      {isNews && (
        <svg
          aria-hidden
          width={LAST_CALL_SIGN_SIZE_PX}
          height={LAST_CALL_SIGN_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={SERVER_FELL_COLOR}
          strokeWidth={LAST_CALL_SIGN_WIDTH}
          strokeLinecap="round"
          className="flex-shrink-0"
          style={{
            marginTop: LAST_CALL_SIGN_TOP_PX,
          }}
        >
          <path d="M12 4 2.6 20h18.8Z" strokeLinejoin="round" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      )}
      <div
        className="d-flex flex-column flex-fill"
        style={{
          gap: LAST_CALL_TEXT_GAP_PX,
          minWidth: 0,
        }}
      >
        <span
          className="font-monospace"
          style={{
            fontSize: LAST_CALL_LABEL_FONT_SIZE_PX,
            letterSpacing: LAST_CALL_LABEL_LETTER_SPACING_PX,
            color: isNews ? SERVER_FELL_COLOR : SERVER_ROW_FACTS_COLOR,
          }}
        >
          {`${label}${SERVER_FACTS_SEPARATOR}${timeLabel(new Date(failure.at))}`}
        </span>
        <span
          style={{
            color: LAST_CALL_SAID_COLOR,
            fontSize: LAST_CALL_SAID_FONT_SIZE_PX,
            lineHeight: LAST_CALL_SAID_LINE_HEIGHT,
            overflowWrap: "anywhere",
            // Two lines at most.
            display: "-webkit-box",
            WebkitLineClamp: LAST_CALL_SAID_LINES,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {lastCallLine(failure)}
        </span>
        {/* The full sentence stands in the call's own card; this hands the chat over to it. */}
        {isLost ? (
          <span
            className="font-monospace"
            style={{
              fontSize: LAST_CALL_LABEL_FONT_SIZE_PX,
              letterSpacing: LAST_CALL_LABEL_LETTER_SPACING_PX,
              color: SERVER_ROW_FACTS_COLOR,
            }}
          >
            {SERVER_CALL_LOST_LABEL}
          </span>
        ) : (
          <span className="align-self-start">
            <TextAction
              label={SERVER_SHOW_CALL_LABEL}
              onClick={() => void onShow().then((shown) => setIsLost(!shown))}
            />
          </span>
        )}
      </div>
    </div>
  );
}
