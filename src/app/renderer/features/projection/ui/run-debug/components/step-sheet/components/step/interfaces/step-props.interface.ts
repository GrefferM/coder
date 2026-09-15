import type { StepNeighbour } from "../../../../../../../interfaces";

/** What `Step` is handed. */
export interface StepProps {
  step: StepNeighbour;
  isBack: boolean;
  onGo: () => void;
}
