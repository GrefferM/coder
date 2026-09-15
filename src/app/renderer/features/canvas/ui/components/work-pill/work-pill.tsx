import { useElapsed } from "../../../../../hooks";
import { Dot } from "../../../../../components";
import {
  WORK_PILL_BACKGROUND_COLOR,
  WORK_PILL_BORDER_COLOR,
  WORK_PILL_BORDER_RADIUS_PX,
  WORK_PILL_COLOR,
  WORK_PILL_DOT_COLOR,
  WORK_PILL_DOT_GLOW_PX,
  WORK_PILL_DOT_SIZE_PX,
  WORK_PILL_FONT_SIZE_PX,
  WORK_PILL_GAP_PX,
  WORK_PILL_LABEL,
  WORK_PILL_LETTER_SPACING_PX,
  WORK_PILL_PADDING,
  WORK_PILL_SEPARATOR,
} from "./constants";
import type { WorkPillProps } from "./interfaces";

/** «● ПРАЦЮЄ · 00:12» centred under the sphere's labels; catches no pointer. */
export function WorkPill({ startedAt }: WorkPillProps) {
  const elapsed = useElapsed(startedAt);

  return (
    <div
      className="d-flex align-items-center font-monospace text-uppercase"
      style={{
        gap: WORK_PILL_GAP_PX,
        padding: WORK_PILL_PADDING,
        borderRadius: WORK_PILL_BORDER_RADIUS_PX,
        border: `1px solid ${WORK_PILL_BORDER_COLOR}`,
        background: WORK_PILL_BACKGROUND_COLOR,
        color: WORK_PILL_COLOR,
        fontSize: WORK_PILL_FONT_SIZE_PX,
        letterSpacing: WORK_PILL_LETTER_SPACING_PX,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      <Dot color={WORK_PILL_DOT_COLOR} size={WORK_PILL_DOT_SIZE_PX} glow={WORK_PILL_DOT_GLOW_PX} />
      {`${WORK_PILL_LABEL}${WORK_PILL_SEPARATOR}${elapsed}`}
    </div>
  );
}
