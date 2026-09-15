import { useHint } from "../../../../../../../../components";
import { INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { focusRing } from "../../../../../../../../utils/focus";
import {
  RUN_HISTORY_FORGET_BACKGROUND_COLOR,
  RUN_HISTORY_FORGET_BORDER_RADIUS_PX,
  RUN_HISTORY_FORGET_COLOR,
  RUN_HISTORY_FORGET_ICON_SIZE_PX,
  RUN_HISTORY_FORGET_ICON_STROKE,
  RUN_HISTORY_FORGET_INSET_PX,
  RUN_HISTORY_FORGET_LABEL,
  RUN_HISTORY_FORGET_LIT_COLOR,
  RUN_HISTORY_FORGET_RAISED_COLOR,
  RUN_HISTORY_FORGET_SIZE_PX,
} from "../../../../constants";
import type { ForgetCrossProps } from "./interfaces";

/**
 * The cross that deletes a run, standing over the row and not inside it — a press to open is not
 * a press to delete. A run still going has none: the record is being written, and half a record is nobody’s.
 */
export function ForgetCross({ press, isRaised, onForget }: ForgetCrossProps) {
  // A wordless control says what it is in the app's own window, and never in the browser's `title`.
  const said = useHint<HTMLButtonElement>(RUN_HISTORY_FORGET_LABEL, press.isLit, press.isFocused);

  return (
    <button
      ref={said.ref}
      type="button"
      aria-label={RUN_HISTORY_FORGET_LABEL}
      onClick={onForget}
      {...press.handlers}
      className="position-absolute d-flex align-items-center justify-content-center"
      style={{
        top: RUN_HISTORY_FORGET_INSET_PX,
        right: RUN_HISTORY_FORGET_INSET_PX,
        width: RUN_HISTORY_FORGET_SIZE_PX,
        height: RUN_HISTORY_FORGET_SIZE_PX,
        padding: 0,
        border: "none",
        borderRadius: RUN_HISTORY_FORGET_BORDER_RADIUS_PX,
        background: isRaised ? RUN_HISTORY_FORGET_BACKGROUND_COLOR : "transparent",
        color: press.isLit
          ? RUN_HISTORY_FORGET_LIT_COLOR
          : isRaised
            ? RUN_HISTORY_FORGET_RAISED_COLOR
            : RUN_HISTORY_FORGET_COLOR,
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(press.isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      <svg
        width={RUN_HISTORY_FORGET_ICON_SIZE_PX}
        height={RUN_HISTORY_FORGET_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={RUN_HISTORY_FORGET_ICON_STROKE}
        strokeLinecap="round"
      >
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
      {said.hint}
    </button>
  );
}
