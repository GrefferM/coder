import { QUIET_MARK_COLOR } from "../../../constants";
import { CANVAS_DEAD_ID_LENGTH } from "../constants";
import type { LinkEnd } from "../interfaces";
import type { Point } from "../../../utils/math";

/**
 * The end of a line that names nobody, as anything naming an end reads it: the head of the id where a name
 * would be, and the quiet tone, since a colour is an agent's own and there is no agent here.
 */
export function deadEnd(agentId: string, at: Point): LinkEnd {
  return {
    name: agentId.slice(0, CANVAS_DEAD_ID_LENGTH).toUpperCase(),
    color: QUIET_MARK_COLOR,
    x: at.x,
    y: at.y,
  };
}
