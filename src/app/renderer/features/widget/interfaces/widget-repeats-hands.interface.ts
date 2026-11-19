import type { PackedAttachment } from "../../../../../contracts";

/** What the repeats need: whether a sphere's walk is out, and the way to put a question to a sphere. */
export interface WidgetRepeatsHands {
  isOutOf: (agentId: string) => boolean;
  put: (agentId: string, text: string, attached: PackedAttachment[]) => Promise<boolean>;
}
