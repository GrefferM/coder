import {
  HANDOFF_ROW_ARROW_HEIGHT_PX,
  HANDOFF_ROW_ARROW_WIDTH_PX,
  HANDOFF_ROW_COLOR,
  HANDOFF_ROW_FONT_SIZE_PX,
  HANDOFF_ROW_GAP_PX,
  HANDOFF_ROW_INNER_GAP_PX,
  HANDOFF_ROW_LETTER_SPACING_PX,
  HANDOFF_ROW_REASON_SEPARATOR,
  HANDOFF_ROW_RULE_COLOR,
  HANDOFF_ROW_STOPPED_COLOR,
} from "./constants";
import type { HandoffRowProps } from "./interfaces";

/**
 * «EDITOR ПЕРЕДАЄ → REVIEWER», each name in its colour and the arrow in the sender's; with `reason`, dashed.
 * With no sender the row is about one agent alone: «ПИТАННЯ НЕ ПІШЛО ⇢ EDITOR · ВИМКНЕНИЙ».
 */
export function HandoffRow({ word, fromName, fromColor, name, color, reason }: HandoffRowProps) {
  const isStopped = reason !== null;
  const isSent = fromName !== null;
  const shown = isStopped && isSent ? HANDOFF_ROW_STOPPED_COLOR : color;
  const sending = isStopped || fromColor === null ? HANDOFF_ROW_STOPPED_COLOR : fromColor;
  const rule = {
    height: 0,
    borderTop: `1px ${isStopped || !isSent ? "dashed" : "solid"} ${HANDOFF_ROW_RULE_COLOR}`,
  };

  return (
    <div
      className="d-flex align-items-center"
      style={{
        gap: HANDOFF_ROW_GAP_PX,
      }}
    >
      <span className="flex-fill" style={rule} />
      <span
        className="d-flex align-items-center font-monospace text-uppercase"
        style={{
          gap: HANDOFF_ROW_INNER_GAP_PX,
          color: isStopped || !isSent ? HANDOFF_ROW_STOPPED_COLOR : HANDOFF_ROW_COLOR,
          fontSize: HANDOFF_ROW_FONT_SIZE_PX,
          letterSpacing: HANDOFF_ROW_LETTER_SPACING_PX,
        }}
      >
        {isSent && (
          <span
            style={{
              color: sending,
            }}
          >
            {fromName}
          </span>
        )}
        {word}
        <svg width={HANDOFF_ROW_ARROW_WIDTH_PX} height={HANDOFF_ROW_ARROW_HEIGHT_PX} viewBox="0 0 16 8" fill="none">
          <path
            d="M0 4h11"
            stroke={sending}
            strokeWidth="1.4"
            strokeDasharray={isStopped || !isSent ? "3 3" : undefined}
          />
          <path d="M16 4 10 1.4v5.2Z" fill={sending} />
        </svg>
        <span
          style={{
            color: shown,
          }}
        >
          {name}
        </span>
        {isStopped && <span>{`${HANDOFF_ROW_REASON_SEPARATOR}${reason}`}</span>}
      </span>
      <span className="flex-fill" style={rule} />
    </div>
  );
}
