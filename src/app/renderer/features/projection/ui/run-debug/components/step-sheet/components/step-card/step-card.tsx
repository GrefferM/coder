import { stepCardLabel, stepUnknownWord } from "../../../../../../words";
import { Mark } from "../../../../../../../../components";
import {
  STEP_SHEET_CARD_BORDER_COLOR,
  STEP_SHEET_CARD_COLOR,
  STEP_SHEET_CARD_FONT_SIZE_PX,
  STEP_SHEET_CARD_GAP_PX,
  STEP_SHEET_CARD_LETTER_SPACING_PX,
  STEP_SHEET_CARD_PADDING,
  STEP_SHEET_SEPARATOR,
  STEP_SHEET_UNKNOWN_COLOR,
} from "../../constants";
import type { StepCardProps } from "./interfaces";

/**
 * What the turn ran on, in one mono line — and under it, where a number of that step was never written,
 * the one line that says why, standing once per step and speaking for every dash above it. In the lower sheet the
 * head has room for the line, so it stands beside the name and the caption goes with it.
 */
export function StepCard({ step, isBeside }: StepCardProps) {
  const unknown = stepUnknownWord(step);

  if (isBeside) {
    return (
      <Mark color={STEP_SHEET_CARD_COLOR} isUpperCase={false} className="flex-shrink-0">
        {unknown === null ? stepCardLabel(step) : `${stepCardLabel(step)}${STEP_SHEET_SEPARATOR}${unknown}`}
      </Mark>
    );
  }

  return (
    <div
      className="d-flex flex-column font-monospace flex-shrink-0"
      style={{
        gap: STEP_SHEET_CARD_GAP_PX,
        padding: STEP_SHEET_CARD_PADDING,
        borderBottom: `1px solid ${STEP_SHEET_CARD_BORDER_COLOR}`,
        color: STEP_SHEET_CARD_COLOR,
        fontSize: STEP_SHEET_CARD_FONT_SIZE_PX,
        letterSpacing: STEP_SHEET_CARD_LETTER_SPACING_PX,
      }}
    >
      <span>{stepCardLabel(step)}</span>
      {unknown !== null && (
        <span
          style={{
            color: STEP_SHEET_UNKNOWN_COLOR,
          }}
        >
          {unknown}
        </span>
      )}
    </div>
  );
}
