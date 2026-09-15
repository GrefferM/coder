import { useInteraction } from "../../hooks";
import { Mark } from "../mark";
import { Hairline } from "../hairline";
import { INTERACTION_PRESSED_SHIFT_PX, INTERACTION_TRANSITION } from "../../constants";
import { focusRing } from "../../utils/focus";
import {
  LOST_TIE_COLOR,
  LOST_TIE_GAP_PX,
  LOST_TIE_HEAD_GAP_PX,
  LOST_TIE_HEAD_PADDING_TOP_PX,
  LOST_TIE_ICON_SIZE_PX,
  LOST_TIE_LABEL,
  LOST_TIE_NOTE_COLOR,
  LOST_TIE_NOTE_FONT_SIZE_PX,
  LOST_TIE_NOTE_GAP_PX,
  LOST_TIE_NOTE_LINE_HEIGHT,
  LOST_TIE_NOTE_PADDING,
  LOST_TIE_REMOVE_BACKGROUND_COLOR,
  LOST_TIE_REMOVE_BORDER_RADIUS_PX,
  LOST_TIE_REMOVE_FONT_SIZE_PX,
  LOST_TIE_REMOVE_LETTER_SPACING_PX,
  LOST_TIE_REMOVE_LIT_BACKGROUND_COLOR,
  LOST_TIE_REMOVE_LIT_BORDER_COLOR,
  LOST_TIE_REMOVE_LIT_COLOR,
  LOST_TIE_REMOVE_PADDING,
  LOST_TIE_RULE_COLOR,
} from "./constants";
import type { LostTieProps } from "./interfaces";

/**
 * A tie the project has lost — its own group under the field that still holds it, in the broken
 * colour, with the sentence saying what is gone and the one act that takes the tie away. What is gone is not restored.
 */
export function LostTie({ note, removeLabel, children, onRemove }: LostTieProps) {
  const remove = useInteraction();
  const isBright = remove.isLit && !remove.isPressed;

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: LOST_TIE_GAP_PX,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: LOST_TIE_HEAD_GAP_PX,
          paddingTop: LOST_TIE_HEAD_PADDING_TOP_PX,
        }}
      >
        <svg
          width={LOST_TIE_ICON_SIZE_PX}
          height={LOST_TIE_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={LOST_TIE_COLOR}
          strokeWidth="2.2"
          strokeLinecap="round"
          className="flex-shrink-0"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5h.01" />
        </svg>
        <Mark color={LOST_TIE_COLOR} isUpperCase={false}>
          {LOST_TIE_LABEL}
        </Mark>
        <Hairline color={LOST_TIE_RULE_COLOR} className="flex-fill" />
      </div>

      {children}

      <div
        className="d-flex flex-column"
        style={{
          gap: LOST_TIE_NOTE_GAP_PX,
          padding: LOST_TIE_NOTE_PADDING,
        }}
      >
        {note !== undefined && (
          <span
            style={{
              color: LOST_TIE_NOTE_COLOR,
              fontSize: LOST_TIE_NOTE_FONT_SIZE_PX,
              lineHeight: LOST_TIE_NOTE_LINE_HEIGHT,
            }}
          >
            {note}
          </span>
        )}
        {removeLabel !== undefined && onRemove !== undefined && (
          <div className="d-flex justify-content-end">
            <button
              type="button"
              onClick={onRemove}
              {...remove.handlers}
              className="font-monospace"
              style={{
                padding: LOST_TIE_REMOVE_PADDING,
                borderRadius: LOST_TIE_REMOVE_BORDER_RADIUS_PX,
                border: `1px solid ${isBright ? LOST_TIE_REMOVE_LIT_BORDER_COLOR : LOST_TIE_RULE_COLOR}`,
                background: isBright ? LOST_TIE_REMOVE_LIT_BACKGROUND_COLOR : LOST_TIE_REMOVE_BACKGROUND_COLOR,
                color: isBright ? LOST_TIE_REMOVE_LIT_COLOR : LOST_TIE_COLOR,
                fontSize: LOST_TIE_REMOVE_FONT_SIZE_PX,
                letterSpacing: LOST_TIE_REMOVE_LETTER_SPACING_PX,
                cursor: "pointer",
                transform: remove.isPressed ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
                outline: "none",
                boxShadow: focusRing(remove.isFocused, true),
                transition: INTERACTION_TRANSITION,
              }}
            >
              {removeLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
