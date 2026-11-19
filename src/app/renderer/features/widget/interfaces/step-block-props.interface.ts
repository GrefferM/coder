import type { Agent } from "../../../interfaces";
import type { CardAloud } from "../../speech";
import type { WidgetStep } from "./widget-step.interface";

export interface StepBlockProps {
  step: WidgetStep;
  /** `null` where the agent has since gone from the project. */
  agent: Agent | null;
  /** The speaker over the answer; `null` where it has no words to read. */
  aloud: CardAloud | null;
}
