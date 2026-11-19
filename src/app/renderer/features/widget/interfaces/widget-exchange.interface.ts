import type { ChatMessage, TurnOut } from "../../../../../contracts";
import type { WidgetStep } from "./widget-step.interface";

/** One question from the widget and its walk: the answers so far, the turns still out, and whether it ended. */
export interface WidgetExchange {
  walkId: string;
  question: ChatMessage | null;
  steps: WidgetStep[];
  working: TurnOut[];
  isStopped: boolean;
}
