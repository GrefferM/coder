import { IconButton } from "../../../../../../../../../../components";
import { INTERACTION_HOVER_TEXT_COLOR } from "../../../../../../../../../../constants";
import {
  PINNED_ROW_FONT_SIZE_PX,
  PINNED_ROW_GAP_PX,
  PINNED_ROW_NAME_COLOR,
  PINNED_ROW_SIGN,
  PINNED_ROW_SIGN_COLOR,
  PINNED_ROW_UNPIN_COLOR,
  PINNED_ROW_UNPIN_LABEL,
  PINNED_ROW_UNPIN_SIZE_PX,
  PINNED_ROW_EMPTY_BORDER_COLOR,
  PINNED_ROW_VALUE_BORDER_RADIUS_PX,
  PINNED_ROW_VALUE_COLOR,
  PINNED_ROW_VALUE_PADDING,
  PINNED_ROW_VALUE_PLACEHOLDER,
} from "./constants";
import type { PinnedRowProps } from "./interfaces";

/** An argument pinned for this agent; only the value is editable, the cross unpins. */
export function PinnedRow({ name, value, onValueChange, onUnpin }: PinnedRowProps) {
  return (
    <div
      className="d-flex align-items-center"
      style={{
        gap: PINNED_ROW_GAP_PX,
      }}
    >
      <span
        className="font-monospace text-truncate"
        style={{
          color: PINNED_ROW_NAME_COLOR,
          fontSize: PINNED_ROW_FONT_SIZE_PX,
        }}
      >
        {name}
      </span>
      <span
        className="font-monospace flex-shrink-0"
        style={{
          color: PINNED_ROW_SIGN_COLOR,
          fontSize: PINNED_ROW_FONT_SIZE_PX,
        }}
      >
        {PINNED_ROW_SIGN}
      </span>
      <input
        spellCheck={false}
        value={value}
        aria-label={name}
        placeholder={PINNED_ROW_VALUE_PLACEHOLDER}
        onChange={(event) => onValueChange(event.target.value)}
        className="font-monospace flex-fill"
        style={{
          // Empty pin: dashed edge; filled: bare accent field.
          border: `1px ${value === "" ? "dashed" : "solid"} ${value === "" ? PINNED_ROW_EMPTY_BORDER_COLOR : "transparent"}`,
          borderRadius: PINNED_ROW_VALUE_BORDER_RADIUS_PX,
          padding: PINNED_ROW_VALUE_PADDING,
          background: "transparent",
          color: PINNED_ROW_VALUE_COLOR,
          fontSize: PINNED_ROW_FONT_SIZE_PX,
          outline: "none",
          minWidth: 0,
        }}
      />
      <IconButton
        label={`${PINNED_ROW_UNPIN_LABEL} ${name}`}
        onPress={onUnpin}
        tone={{
          rest: PINNED_ROW_UNPIN_COLOR,
          lit: INTERACTION_HOVER_TEXT_COLOR,
        }}
      >
        <svg
          width={PINNED_ROW_UNPIN_SIZE_PX}
          height={PINNED_ROW_UNPIN_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </IconButton>
    </div>
  );
}
