import { Dot } from "../../../../../components";
import { ARMED_SOURCE_COLOR } from "../../../constants";
import { SPHERE_ORB_RADIUS_PX, SPHERE_SIZE_PX } from "../../../../../components/sphere/constants";
import {
  CALL_PILL_BACKGROUND_COLOR,
  CALL_PILL_BORDER_COLOR,
  CALL_PILL_DOT_GLOW_PX,
  CALL_PILL_DOT_SIZE_PX,
  CALL_PILL_FONT_SIZE_PX,
  CALL_PILL_GAP_PX,
  CALL_PILL_LETTER_SPACING_PX,
  CALL_PILL_PADDING,
  CALL_PILL_RADIUS_PX,
} from "./constants";
import type { CallPillProps } from "./interfaces";

/**
 * What the agent is calling now, beside its sphere: a command by its name, a server by the server's name, never the
 * function. Coloured by the source, like its mark on the arc; also shown for sources the arc does not show.
 */
export function CallPill({ name, source }: CallPillProps) {
  const color = ARMED_SOURCE_COLOR[source];

  return (
    <span
      className="d-flex align-items-center font-monospace text-nowrap"
      style={{
        position: "absolute",
        left: SPHERE_SIZE_PX + CALL_PILL_GAP_PX,
        // The arc's highest point, the one place where the pill stays fixed as the arc grows or shrinks.
        top: SPHERE_SIZE_PX / 2 - SPHERE_ORB_RADIUS_PX,
        gap: CALL_PILL_GAP_PX,
        padding: CALL_PILL_PADDING,
        borderRadius: CALL_PILL_RADIUS_PX,
        background: CALL_PILL_BACKGROUND_COLOR,
        border: `1px solid ${CALL_PILL_BORDER_COLOR}`,
        color,
        fontSize: CALL_PILL_FONT_SIZE_PX,
        letterSpacing: CALL_PILL_LETTER_SPACING_PX,
        pointerEvents: "none",
      }}
    >
      <Dot color={color} size={CALL_PILL_DOT_SIZE_PX} glow={CALL_PILL_DOT_GLOW_PX} />
      {name}
    </span>
  );
}
