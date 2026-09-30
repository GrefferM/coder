import { BackChevron } from "../back-chevron";
import { useInteraction } from "../../hooks";
import { Mark } from "../mark";
import { INTERACTION_HOVER_TEXT_COLOR, INTERACTION_TRANSITION } from "../../constants";
import {
  STEP_HEAD_BACKGROUND_COLOR,
  STEP_HEAD_BORDER_COLOR,
  STEP_HEAD_COLOR,
  STEP_HEAD_FONT_SIZE_PX,
  STEP_HEAD_GAP_PX,
  STEP_HEAD_LETTER_SPACING_PX,
  STEP_HEAD_PADDING,
  STEP_HEAD_SEPARATOR,
} from "./constants";
import type { StepHeadProps } from "./interfaces";

/**
 * The head of every step inside a panel: whose it is, what it is about, and the way back. The whole head is the back
 * button.
 */
export function StepHead({ whose, name, backLabel, onBack }: StepHeadProps) {
  const back = useInteraction();

  return (
    <button
      type="button"
      aria-label={backLabel}
      onClick={onBack}
      {...back.handlers}
      className="d-flex align-items-center flex-shrink-0 text-start"
      style={{
        padding: STEP_HEAD_PADDING,
        gap: STEP_HEAD_GAP_PX,
        border: "none",
        borderBottom: `1px solid ${STEP_HEAD_BORDER_COLOR}`,
        background: STEP_HEAD_BACKGROUND_COLOR,
        color: back.isLit ? INTERACTION_HOVER_TEXT_COLOR : STEP_HEAD_COLOR,
        cursor: "pointer",
        transition: INTERACTION_TRANSITION,
      }}
    >
      <BackChevron />
      <Mark size={STEP_HEAD_FONT_SIZE_PX} spacing={STEP_HEAD_LETTER_SPACING_PX} className="text-truncate">
        {`${whose}${STEP_HEAD_SEPARATOR}${name}`}
      </Mark>
    </button>
  );
}
