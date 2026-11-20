import type { WidgetQuestion } from "./widget-question.interface";

/** The repeats of one question: what goes each time and to which sphere, how many went, and how many in all. */
export interface RepeatCycle {
  question: WidgetQuestion;
  sent: number;
  total: number;
}
