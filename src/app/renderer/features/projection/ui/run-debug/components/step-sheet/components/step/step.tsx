import { TextButton } from "../../../../../../../../components";
import {
  STEP_SHEET_FOOT_ARROW_GAP_PX,
  STEP_SHEET_FOOT_ARROW_SIZE_PX,
  STEP_SHEET_FOOT_TONE,
  STEP_SHEET_NUMBER_PREFIX,
  STEP_SHEET_SEPARATOR,
} from "../../constants";
import type { StepProps } from "./interfaces";

/** One end of the foot: the step before or after, by number and whose turn it was. */
export function Step({ step, isBack, onGo }: StepProps) {
  const arrow = (
    <svg
      width={STEP_SHEET_FOOT_ARROW_SIZE_PX}
      height={STEP_SHEET_FOOT_ARROW_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={isBack ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
    </svg>
  );

  return (
    <TextButton tone={STEP_SHEET_FOOT_TONE} onPress={onGo} gap={STEP_SHEET_FOOT_ARROW_GAP_PX}>
      {isBack && arrow}
      {`${STEP_SHEET_NUMBER_PREFIX}${step.number}${STEP_SHEET_SEPARATOR}${step.agentName}`}
      {!isBack && arrow}
    </TextButton>
  );
}
