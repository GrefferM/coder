import { LINK_ARROW_HALF_WIDTH_PX, LINK_ARROW_LENGTH_PX, LINK_HEAD_GAP_PX, LINK_TAIL_GAP_PX } from "../constants";
import type { Point } from "../../../utils/math";
import type { LinkLine } from "../interfaces";

/** The line between two spheres: gapped off both edges, at the arrival angle. */
export function linkLine(from: Point, to: Point, radiusPx: number): LinkLine {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const x1 = from.x + ux * (radiusPx + LINK_TAIL_GAP_PX);
  const y1 = from.y + uy * (radiusPx + LINK_TAIL_GAP_PX);
  const x2 = from.x + ux * (length - radiusPx - LINK_HEAD_GAP_PX);
  const y2 = from.y + uy * (length - radiusPx - LINK_HEAD_GAP_PX);

  const baseX = x2 - ux * LINK_ARROW_LENGTH_PX;
  const baseY = y2 - uy * LINK_ARROW_LENGTH_PX;
  const wingX = -uy * LINK_ARROW_HALF_WIDTH_PX;
  const wingY = ux * LINK_ARROW_HALF_WIDTH_PX;

  return {
    x1,
    y1,
    x2,
    y2,
    stem: {
      x: baseX,
      y: baseY,
    },
    arrow: `${x2},${y2} ${baseX + wingX},${baseY + wingY} ${baseX - wingX},${baseY - wingY}`,
    middle: {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
    },
  };
}
