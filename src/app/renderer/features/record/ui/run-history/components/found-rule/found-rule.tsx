import { dayLabel, timeLabel } from "../../../../../../utils/dates";
import {
  FOUND_RULE_ASKED_COLOR,
  FOUND_RULE_ASKED_FONT_SIZE_PX,
  FOUND_RULE_ASKED_LINE_HEIGHT,
  FOUND_RULE_GAP_PX,
  FOUND_RULE_PADDING,
  FOUND_RULE_WHEN_COLOR,
  FOUND_RULE_WHEN_FONT_SIZE_PX,
  FOUND_RULE_WHEN_LETTER_SPACING_PX,
} from "../../constants";
import type { FoundRuleProps } from "./interfaces";

/**
 * The quiet rule of a change. The list is flat and stands by the hour of each message, so a row
 * says nothing about which run it belongs to; this says it, and only where the record jumped — where the row above
 * came from another run.
 *
 * It is not a group and not a heading: it collects nothing, reorders nothing, takes no highlight and cannot be
 * pressed — the row is what a hand presses. A run braided with another is named twice, and that is right: «where am
 * I now» is a question that comes back every time the record jumps.
 */
export function FoundRule({ run, now }: FoundRuleProps) {
  return (
    <div
      className="d-flex align-items-baseline"
      style={{
        gap: FOUND_RULE_GAP_PX,
        padding: FOUND_RULE_PADDING,
      }}
    >
      <span
        className="font-monospace flex-shrink-0"
        style={{
          color: FOUND_RULE_WHEN_COLOR,
          fontSize: FOUND_RULE_WHEN_FONT_SIZE_PX,
          letterSpacing: FOUND_RULE_WHEN_LETTER_SPACING_PX,
        }}
      >
        {`${dayLabel(run.askedAt, now)} ${timeLabel(run.askedAt)}`}
      </span>
      {/* The start of the question, one line and no more — the whole of it is read inside the run. */}
      <span
        className="text-truncate"
        style={{
          color: FOUND_RULE_ASKED_COLOR,
          fontSize: FOUND_RULE_ASKED_FONT_SIZE_PX,
          lineHeight: FOUND_RULE_ASKED_LINE_HEIGHT,
          minWidth: 0,
        }}
      >
        {run.asked}
      </span>
    </div>
  );
}
