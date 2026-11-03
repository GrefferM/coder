import type { FieldStanding } from "../interfaces";

/** Whether the draft can go: it has words and the field is open. */
export function canAsk(draft: string, standing: FieldStanding): boolean {
  return draft.trim() !== "" && standing === "open";
}
