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
 * What the turn ran on in one mono line, and under it, where a step's number was never written, one line saying why,
 * for every dash above. In the lower sheet it sits beside the name with the caption.
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
