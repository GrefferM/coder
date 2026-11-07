import { SCHEDULES_ICON_SIZE_PX, SCHEDULES_ICON_STROKE_WIDTH } from "./constants";
import type { SchedulesIconProps } from "./interfaces";

/** The schedules section's glyph: a clock face (51a). */
export function SchedulesIcon({
  sizePx = SCHEDULES_ICON_SIZE_PX,
  strokeWidth = SCHEDULES_ICON_STROKE_WIDTH,
}: SchedulesIconProps) {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </svg>
  );
}
