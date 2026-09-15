import { FIELD_LEAST_HEIGHT_PX, FIELD_MOST_HEIGHT_PX } from "../constants";

/** How tall the field may stand, whatever the hand asks for: never under its own least, never over what the stream can spare. */
export function withinField(height: number): number {
  return Math.min(FIELD_MOST_HEIGHT_PX, Math.max(FIELD_LEAST_HEIGHT_PX, Math.round(height)));
}
