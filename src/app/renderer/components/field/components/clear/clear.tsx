import { useInteraction } from "../../../../hooks";
import { FIELD_CLEAR_COLOR, FIELD_CLEAR_LABEL, FIELD_CLEAR_LIT_COLOR, FIELD_CLEAR_SIZE_PX } from "../../constants";
import type { ClearProps } from "./interfaces";

/** The cross at the field's right edge; it empties what the field stands for, not what the field shows. */
export function Clear({ onClear }: ClearProps) {
  const { isLit, handlers } = useInteraction();

  return (
    <button
      type="button"
      aria-label={FIELD_CLEAR_LABEL}
      onClick={onClear}
      {...handlers}
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: FIELD_CLEAR_SIZE_PX,
        height: FIELD_CLEAR_SIZE_PX,
        padding: 0,
        border: "none",
        background: "transparent",
        color: isLit ? FIELD_CLEAR_LIT_COLOR : FIELD_CLEAR_COLOR,
        cursor: "pointer",
        outline: "none",
      }}
    >
      <svg
        width={FIELD_CLEAR_SIZE_PX}
        height={FIELD_CLEAR_SIZE_PX}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M7 7l10 10M17 7 7 17" />
      </svg>
    </button>
  );
}
