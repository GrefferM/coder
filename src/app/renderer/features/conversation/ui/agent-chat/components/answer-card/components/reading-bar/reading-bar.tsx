import { READING_BAR_COLOR, READING_BAR_GROUND_COLOR, READING_BAR_HEIGHT_PX, READING_BAR_RADIUS_PX } from "./constants";
import type { ReadingBarProps } from "./interfaces";

/** How much of an answer has been read, as a thin bar. */
export function ReadingBar({ ratio }: ReadingBarProps) {
  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      className="d-block overflow-hidden"
      style={{
        height: READING_BAR_HEIGHT_PX,
        borderRadius: READING_BAR_RADIUS_PX,
        background: READING_BAR_GROUND_COLOR,
      }}
    >
      <span
        className="d-block h-100"
        style={{
          width: `${ratio * 100}%`,
          background: READING_BAR_COLOR,
        }}
      />
    </span>
  );
}
