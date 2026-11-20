import type { WidgetQuestion } from "./widget-question.interface";

/** What the repeats need: whether a sphere's walk is out, and the way to put a question to a sphere. */
export interface WidgetRepeatsHands {
  isOutOf: (agentId: string) => boolean;
  put: (question: WidgetQuestion) => Promise<boolean>;
}
