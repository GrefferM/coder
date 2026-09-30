import type { FieldStanding } from "../interfaces";

/**
 * Whether the drafted question can go now: it has words and the field is open. A walking field holds the draft until
 * the walk ends; a stitched one has nobody to ask.
 */
export function canAsk(draft: string, standing: FieldStanding): boolean {
  return draft.trim() !== "" && standing === "open";
}
