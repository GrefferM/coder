import type { FieldStanding } from "../interfaces";

/**
 * Whether the question standing in the field can go now — there are words in it, and the field is
 * open. A walking field holds what is typed until the walk ends, and a stitched one has nobody to ask.
 */
export function canAsk(draft: string, standing: FieldStanding): boolean {
  return draft.trim() !== "" && standing === "open";
}
