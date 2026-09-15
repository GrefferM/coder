import { useInteraction } from "../../../../../../../../hooks";
import { useHint } from "../../../../../../../../components";
import { INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { focusRing } from "../../../../../../../../utils/focus";
import {
  RUN_SEARCH_CLEAR_COLOR,
  RUN_SEARCH_CLEAR_ICON_SIZE_PX,
  RUN_SEARCH_CLEAR_ICON_STROKE,
  RUN_SEARCH_CLEAR_LABEL,
  RUN_SEARCH_CLEAR_LIT_BACKGROUND_COLOR,
  RUN_SEARCH_CLEAR_LIT_COLOR,
  RUN_SEARCH_CLEAR_PATH,
  RUN_SEARCH_CLEAR_RADIUS_PX,
  RUN_SEARCH_CLEAR_SIZE_PX,
} from "../../../../constants";
import type { ClearProps } from "./interfaces";

/** The cross that takes the word out of the field — the same act as emptying it by hand. */
export function Clear({ onClear }: ClearProps) {
  const { isLit, isFocused, handlers } = useInteraction();
  // A wordless control says what it is in the app's own window, and never in the browser's `title`.
  const said = useHint<HTMLButtonElement>(RUN_SEARCH_CLEAR_LABEL, isLit, isFocused);

  return (
    <button
      ref={said.ref}
      type="button"
      aria-label={RUN_SEARCH_CLEAR_LABEL}
      onClick={onClear}
      {...handlers}
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: RUN_SEARCH_CLEAR_SIZE_PX,
        height: RUN_SEARCH_CLEAR_SIZE_PX,
        padding: 0,
        border: "none",
        borderRadius: RUN_SEARCH_CLEAR_RADIUS_PX,
        background: isLit ? RUN_SEARCH_CLEAR_LIT_BACKGROUND_COLOR : "transparent",
        cursor: "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      <svg
        width={RUN_SEARCH_CLEAR_ICON_SIZE_PX}
        height={RUN_SEARCH_CLEAR_ICON_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke={isLit ? RUN_SEARCH_CLEAR_LIT_COLOR : RUN_SEARCH_CLEAR_COLOR}
        strokeWidth={RUN_SEARCH_CLEAR_ICON_STROKE}
        strokeLinecap="round"
        aria-hidden
      >
        <path d={RUN_SEARCH_CLEAR_PATH} />
      </svg>
      {said.hint}
    </button>
  );
}
