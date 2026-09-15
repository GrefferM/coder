import { PICKER_OPEN_BORDER_COLOR } from "../../../../../../../../components/picker-shell/constants";
import { PROMPT_PICKER_CHECK_SIZE_PX, PROMPT_PICKER_CHECK_STROKE_WIDTH } from "../../constants";

/** Accent checkmark on the chosen option. */
export function ChosenCheck() {
  return (
    <svg
      width={PROMPT_PICKER_CHECK_SIZE_PX}
      height={PROMPT_PICKER_CHECK_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={PICKER_OPEN_BORDER_COLOR}
      strokeWidth={PROMPT_PICKER_CHECK_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
