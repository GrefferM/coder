import { Dot } from "../../../../../components";
import { ARMED_COMMANDS_COLOR, ARMED_SERVERS_COLOR } from "../../../constants";
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
 * What the agent is calling this moment, said beside its sphere and nowhere else. No mini-sphere grows, fills or
 * glows for it: the general sphere already says the agent is working.
 *
 * It stands beside the sphere and not beside a mini-sphere, so a call from a source the arc does not show is
 * announced just the same.
 *
 * A call to a server is said by the **server's** name and never by the function's — which function it was is the
 * page's to say. The colour is that source's own, so the pill and the mark the call came from agree.
 */
export function CallPill({ name, isCommand }: CallPillProps) {
  const color = isCommand ? ARMED_COMMANDS_COLOR : ARMED_SERVERS_COLOR;

  return (
    <span
      className="d-flex align-items-center font-monospace text-nowrap"
      style={{
        position: "absolute",
        left: SPHERE_SIZE_PX + CALL_PILL_GAP_PX,
        // The arc is a circle around this box's own middle, so its highest point is the one place a pill can stand
        // and stay there while the arc grows and shrinks.
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
