import {
  STANDING_CHANGES_BORDER_COLOR,
  STANDING_CHANGES_CARD_BACKGROUND_COLOR,
  STANDING_CHANGES_CARD_BORDER_RADIUS_PX,
  STANDING_CHANGES_CARD_GAP_PX,
  STANDING_CHANGES_CARD_PADDING,
  STANDING_CHANGES_GONE_LABEL,
  STANDING_CHANGES_LABEL_COLOR,
  STANDING_CHANGES_LINE_COLOR,
  STANDING_CHANGES_LINE_FONT_SIZE_PX,
  STANDING_CHANGES_LINE_GAP_PX,
  STANDING_CHANGES_NAME_FONT_SIZE_PX,
  STANDING_CHANGES_NAME_GAP_PX,
  STANDING_CHANGES_NOW_LABEL,
  STANDING_CHANGES_SEPARATOR,
  STANDING_CHANGES_TEMPERATURE_DECIMALS,
  STANDING_CHANGES_TEMPERATURE_PREFIX,
  STANDING_CHANGES_THEN_LABEL,
  STANDING_CHANGES_WHEN_GAP_PX,
  STANDING_GONE_BORDER_COLOR,
  STANDING_GONE_COLOR,
} from "../../../../../../constants";
import type { ChangeCardProps } from "./interfaces";

/** «claude-sonnet-4.5 · темп. 0.2»: what a turn ran on, used by both halves of the card. */
function circumstances(model: string | null, temperature: number | null): string {
  return [
    model,
    temperature === null
      ? null
      : `${STANDING_CHANGES_TEMPERATURE_PREFIX}${temperature.toFixed(STANDING_CHANGES_TEMPERATURE_DECIMALS)}`,
  ]
    .filter((part): part is string => part !== null)
    .join(STANDING_CHANGES_SEPARATOR);
}

/** One agent's two lines: the record's and the project's current. */
export function ChangeCard({ change }: ChangeCardProps) {
  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        gap: STANDING_CHANGES_CARD_GAP_PX,
        padding: STANDING_CHANGES_CARD_PADDING,
        borderRadius: STANDING_CHANGES_CARD_BORDER_RADIUS_PX,
        background: STANDING_CHANGES_CARD_BACKGROUND_COLOR,
        // Pink edge marks what the project does not have.
        border: `1px solid ${change.isGone ? STANDING_GONE_BORDER_COLOR : STANDING_CHANGES_BORDER_COLOR}`,
        minWidth: 0,
      }}
    >
      <span
        className="d-flex align-items-center font-monospace text-uppercase"
        style={{
          gap: STANDING_CHANGES_NAME_GAP_PX,
          color: STANDING_CHANGES_LINE_COLOR,
          fontSize: STANDING_CHANGES_NAME_FONT_SIZE_PX,
        }}
      >
        {change.name}
      </span>
      <div
        className="d-flex flex-column font-monospace"
        style={{
          gap: STANDING_CHANGES_LINE_GAP_PX,
          color: STANDING_CHANGES_LINE_COLOR,
          fontSize: STANDING_CHANGES_LINE_FONT_SIZE_PX,
        }}
      >
        <div
          className="d-flex"
          style={{
            gap: STANDING_CHANGES_WHEN_GAP_PX,
          }}
        >
          <span
            style={{
              color: STANDING_CHANGES_LABEL_COLOR,
            }}
          >
            {STANDING_CHANGES_THEN_LABEL}
          </span>
          {circumstances(change.wasModel, change.wasTemperature)}
        </div>
        <div
          className="d-flex"
          style={{
            gap: STANDING_CHANGES_WHEN_GAP_PX,
          }}
        >
          <span
            style={{
              color: STANDING_CHANGES_LABEL_COLOR,
            }}
          >
            {STANDING_CHANGES_NOW_LABEL}
          </span>
          {change.isGone ? (
            <span
              style={{
                color: STANDING_GONE_COLOR,
              }}
            >
              {STANDING_CHANGES_GONE_LABEL}
            </span>
          ) : (
            circumstances(change.nowModel, change.nowTemperature)
          )}
        </div>
      </div>
    </div>
  );
}
