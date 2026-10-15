import {
  STANDING_BAND_BACKGROUND_COLOR,
  STANDING_BAND_BORDER_COLOR,
  STANDING_BAND_BORDER_RADIUS_PX,
  STANDING_BAND_COLOR,
  STANDING_BAND_FONT_SIZE_PX,
  STANDING_BAND_GAP_PX,
  STANDING_BAND_ICON_SIZE_PX,
  STANDING_BAND_LABEL,
  STANDING_BAND_LETTER_SPACING_PX,
  STANDING_BAND_PADDING,
} from "../../../../constants";
import type { StandingBandProps } from "./interfaces";

/**
 * Says which half of the screen is «then» and which «now»: turn circumstances are the record's, names the project's.
 * Shown only when an agent was renamed or is gone.
 */
export function StandingBand({ standings }: StandingBandProps) {
  if (!standings.some((standing) => standing.isGone || standing.wasName !== null)) {
    return null;
  }

  return (
    <span
      className="d-flex align-items-center font-monospace text-nowrap flex-shrink-0"
      style={{
        gap: STANDING_BAND_GAP_PX,
        padding: STANDING_BAND_PADDING,
        borderRadius: STANDING_BAND_BORDER_RADIUS_PX,
        background: STANDING_BAND_BACKGROUND_COLOR,
        border: `1px solid ${STANDING_BAND_BORDER_COLOR}`,
        color: STANDING_BAND_COLOR,
        fontSize: STANDING_BAND_FONT_SIZE_PX,
        letterSpacing: STANDING_BAND_LETTER_SPACING_PX,
      }}
    >
      <svg
        width={STANDING_BAND_ICON_SIZE_PX}
        height={STANDING_BAND_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={STANDING_BAND_COLOR}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      {STANDING_BAND_LABEL}
    </span>
  );
}
