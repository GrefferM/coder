import type { StepNeighbour } from "../../../../../../../interfaces";

export interface StepProps {
  step: StepNeighbour;
  isBack: boolean;
  onGo: () => void;
}
