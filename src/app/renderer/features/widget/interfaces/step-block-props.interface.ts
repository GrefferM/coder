import type { Agent } from "../../../interfaces";
import type { WidgetStep } from "./widget-step.interface";

export interface StepBlockProps {
  step: WidgetStep;
  /** `null` where the agent has since gone from the project. */
  agent: Agent | null;
}
