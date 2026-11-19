import type { ChatMessage, TurnOut } from "../../../../../contracts";
import type { WidgetStep } from "./widget-step.interface";

/** One question to the widget's sphere and its walk: the answers so far and the turns still out. */
export interface WidgetExchange {
  /** The question's own id. */
  questionId: string;
  question: ChatMessage;
  steps: WidgetStep[];
  working: TurnOut[];
  /** Its walk is still out. */
  isOut: boolean;
}
