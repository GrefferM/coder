import { useInteraction } from "../../../../../../hooks";
import { useHint } from "../../../../../../components";
import { INTERACTION_TRANSITION } from "../../../../../../constants";
import { focusRing } from "../../../../../../utils/focus";
import {
  STREAM_SEARCH_STEP_COLOR,
  STREAM_SEARCH_STEP_ICON_SIZE_PX,
  STREAM_SEARCH_STEP_ICON_STROKE,
  STREAM_SEARCH_STEP_LIT_BACKGROUND_COLOR,
  STREAM_SEARCH_STEP_LIT_COLOR,
  STREAM_SEARCH_STEP_RADIUS_PX,
  STREAM_SEARCH_STEP_SIZE_PX,
  STREAM_SEARCH_STEP_SPENT_COLOR,
} from "../../constants";
import type { StepProps } from "./interfaces";

/** One small act in the search field: the two arrows and the cross that clears the word; one shape for all three. */
export function Step({
  label,
  path,
  isSpent,
  onGo,
  size = STREAM_SEARCH_STEP_ICON_SIZE_PX,
  stroke = STREAM_SEARCH_STEP_ICON_STROKE,
}: StepProps) {
  const { isLit, isFocused, handlers } = useInteraction();
  // A wordless control names itself through the app's hint, not the browser `title`.
  const said = useHint<HTMLButtonElement>(label, isLit, isFocused);

  return (
    <button
      ref={said.ref}
      type="button"
      aria-label={label}
      disabled={isSpent}
      onClick={onGo}
      {...handlers}
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: STREAM_SEARCH_STEP_SIZE_PX,
        height: STREAM_SEARCH_STEP_SIZE_PX,
        padding: 0,
        border: "none",
        borderRadius: STREAM_SEARCH_STEP_RADIUS_PX,
        background: isLit && !isSpent ? STREAM_SEARCH_STEP_LIT_BACKGROUND_COLOR : "transparent",
        cursor: isSpent ? "default" : "pointer",
        outline: "none",
        boxShadow: focusRing(isFocused),
        transition: INTERACTION_TRANSITION,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={
          isSpent ? STREAM_SEARCH_STEP_SPENT_COLOR : isLit ? STREAM_SEARCH_STEP_LIT_COLOR : STREAM_SEARCH_STEP_COLOR
        }
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={path} />
      </svg>
      {said.hint}
    </button>
  );
}
