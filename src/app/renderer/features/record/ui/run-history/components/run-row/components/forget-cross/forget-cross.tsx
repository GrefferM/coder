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

/** Deletes a run. It stands beside the row, not inside it, and a running run has none. */
export function ForgetCross({ press, isRaised, onForget }: ForgetCrossProps) {
  // A wordless control gives its hint in the app's own window, not the browser `title`.
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
