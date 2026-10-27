import type { ChatStopReason } from "./stop-reason.type";

/** Whether a line was cut by the answering agent's own choice: it named others, or ended the branch. */
export function isRouteStop(reason: ChatStopReason | null): boolean {
  return reason === "notChosen" || reason === "finished";
}
