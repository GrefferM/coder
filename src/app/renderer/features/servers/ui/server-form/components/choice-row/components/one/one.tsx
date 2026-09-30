import { useInteraction } from "../../../../../../../../hooks";
import {
  SERVER_FORM_CHOICE_BORDER_COLOR,
  SERVER_FORM_CHOICE_CHOSEN_BACKGROUND,
  SERVER_FORM_CHOICE_CHOSEN_COLOR,
  SERVER_FORM_CHOICE_COLOR,
  SERVER_FORM_CHOICE_FONT_SIZE_PX,
  SERVER_FORM_CHOICE_PADDING,
  SERVER_FORM_CHOICE_RADIUS_PX,
} from "../../../../constants";
import type { OneProps } from "./interfaces";

/** One choice; the chosen one says so with `aria-pressed`, which the keyboard order also reads. */
export function One({ isChosen, label, onChoose }: OneProps) {
  const { isLit, handlers } = useInteraction();

  return (
    <button
      type="button"
      aria-pressed={isChosen}
      onClick={onChoose}
      {...handlers}
      className="font-monospace text-uppercase"
      style={{
        padding: SERVER_FORM_CHOICE_PADDING,
        borderRadius: SERVER_FORM_CHOICE_RADIUS_PX,
        border: `1px solid ${SERVER_FORM_CHOICE_BORDER_COLOR}`,
        background: isChosen ? SERVER_FORM_CHOICE_CHOSEN_BACKGROUND : "transparent",
        color: isChosen || isLit ? SERVER_FORM_CHOICE_CHOSEN_COLOR : SERVER_FORM_CHOICE_COLOR,
        fontSize: SERVER_FORM_CHOICE_FONT_SIZE_PX,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
