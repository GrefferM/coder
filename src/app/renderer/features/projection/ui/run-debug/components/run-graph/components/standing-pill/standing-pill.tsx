import {
  STANDING_GONE_BORDER_COLOR,
  STANDING_GONE_COLOR,
  STANDING_GONE_LABEL,
  STANDING_PILL_BACKGROUND_COLOR,
  STANDING_PILL_BORDER_RADIUS_PX,
  STANDING_PILL_FONT_SIZE_PX,
  STANDING_PILL_GAP_PX,
  STANDING_PILL_ICON_SIZE_PX,
  STANDING_PILL_LETTER_SPACING_PX,
  STANDING_PILL_PADDING,
  STANDING_PILL_RISE_PX,
  STANDING_PILL_SEPARATOR,
  STANDING_RENAMED_BORDER_COLOR,
  STANDING_RENAMED_COLOR,
  STANDING_RENAMED_LABEL,
  STANDING_WAS_PREFIX,
} from "../../../../../../constants";
import type { StandingPillProps } from "./interfaces";

/**
 * Under the sphere of a run, the one line that parts today from the record — the agent is called something
 * else now, or the project no longer has it. Nothing stands here where the record and the project agree, which is
 * most runs: a rule said on every screen stops being read.
 *
 * The recorded name is written in capitals like every other name on a canvas: a name has no case of its own (that is
 * why two agents cannot differ by it), and the label above wears the same capitals — the two must read as one name.
 */
export function StandingPill({ standing }: StandingPillProps) {
  const isGone = standing.isGone;

  if (!isGone && standing.wasName === null) {
    return null;
  }

  const color = isGone ? STANDING_GONE_COLOR : STANDING_RENAMED_COLOR;

  return (
    <span
      className="d-flex justify-content-center"
      style={{
        marginTop: STANDING_PILL_RISE_PX,
      }}
    >
      <span
        className="d-flex align-items-center font-monospace text-nowrap text-uppercase"
        style={{
          gap: STANDING_PILL_GAP_PX,
          padding: STANDING_PILL_PADDING,
          borderRadius: STANDING_PILL_BORDER_RADIUS_PX,
          background: STANDING_PILL_BACKGROUND_COLOR,
          border: `1px ${isGone ? "dashed" : "solid"} ${isGone ? STANDING_GONE_BORDER_COLOR : STANDING_RENAMED_BORDER_COLOR}`,
          color,
          fontSize: STANDING_PILL_FONT_SIZE_PX,
          letterSpacing: STANDING_PILL_LETTER_SPACING_PX,
        }}
      >
        <svg
          width={STANDING_PILL_ICON_SIZE_PX}
          height={STANDING_PILL_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isGone ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 12h12M12 7l5 5-5 5" />}
        </svg>
        {isGone
          ? STANDING_GONE_LABEL
          : `${STANDING_RENAMED_LABEL}${STANDING_PILL_SEPARATOR}${STANDING_WAS_PREFIX}${standing.wasName}`}
      </span>
    </span>
  );
}
