import type { PackedAttachment } from "../../../../../contracts";

/** What the repeats need: whether the chosen sphere's walk is out, and the way to put a question. */
export interface WidgetRepeatsHands {
  isOut: boolean;
  put: (text: string, attached: PackedAttachment[]) => Promise<boolean>;
}
