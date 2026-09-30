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
 * A quiet rule naming the run, shown where the row above came from another run; not a group or heading, cannot be
 * pressed. A run that interleaves with another is named again each time.
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
      {/* The start of the question, one line. */}
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
