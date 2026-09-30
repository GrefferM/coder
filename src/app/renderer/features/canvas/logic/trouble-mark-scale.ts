import { SPHERE_TROUBLE_MARK_SIZE_PX } from "../../../components/sphere/constants";
import { CANVAS_MARK_FLOOR_PX, CANVAS_MARK_HELD_SCALE } from "../constants";

/** The «?» holds 16px down to half scale, then shrinks to 12px; the factor is for the scaled layer. */
export function troubleMarkScale(canvasScale: number): number {
  const heldPx = SPHERE_TROUBLE_MARK_SIZE_PX;
  const wantedPx =
    canvasScale >= CANVAS_MARK_HELD_SCALE
      ? heldPx
      : Math.max(CANVAS_MARK_FLOOR_PX, (heldPx / CANVAS_MARK_HELD_SCALE) * canvasScale);

  return wantedPx / (heldPx * canvasScale);
}
