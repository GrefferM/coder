import type { WholeStep } from "../../../../../../record";

export interface StepSheetProps {
  /** The step that stands open, read back from the record. */
  step: WholeStep;
  /** The pass the step belongs to; its feed and position are named from the steps around it. */
  walk: WholeStep[];
  /** The field is too narrow for the sheet beside the graph, so it lies along the bottom. */
  isBelow: boolean;
  /** The foot walks to the step on either side. */
  onGo: (stepId: string) => void;
  onClose: () => void;
}
