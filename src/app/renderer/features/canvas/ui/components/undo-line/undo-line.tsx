import { TextButton } from "../../../../../components";
import {
  UNDO_ACTION_LABEL,
  UNDO_LINE_ACTION_COLOR,
  UNDO_LINE_ANIMATION,
  UNDO_LINE_BACKGROUND_COLOR,
  UNDO_LINE_BORDER_COLOR,
  UNDO_LINE_BORDER_RADIUS_PX,
  UNDO_LINE_FONT_SIZE_PX,
  UNDO_LINE_GAP_PX,
  UNDO_LINE_LETTER_SPACING_PX,
  UNDO_LINE_MESSAGE_COLOR,
  UNDO_LINE_OLDER_ACTION_COLOR,
  UNDO_LINE_OLDER_BORDER_COLOR,
  UNDO_LINE_OLDER_MESSAGE_COLOR,
  UNDO_LINE_OLDER_OPACITY,
  UNDO_LINE_OLDER_SECONDS_COLOR,
  UNDO_LINE_PADDING,
  UNDO_LINE_SECONDS_COLOR,
  UNDO_LINE_SEPARATOR_HEIGHT_PX,
  UNDO_LINE_SEPARATOR_WIDTH_PX,
  UNDO_LINE_SHADOW,
  UNDO_SECONDS_SUFFIX,
} from "./constants";
import type { UndoLineProps } from "./interfaces";

/** What a deletion took, its undo, and the seconds left. */
export function UndoLine({ message, secondsLeft, isOlder = false, onUndo }: UndoLineProps) {
  return (
    <div
      className="d-flex align-items-center font-monospace text-uppercase"
      style={{
        gap: UNDO_LINE_GAP_PX,
        padding: UNDO_LINE_PADDING,
        borderRadius: UNDO_LINE_BORDER_RADIUS_PX,
        border: `1px solid ${isOlder ? UNDO_LINE_OLDER_BORDER_COLOR : UNDO_LINE_BORDER_COLOR}`,
        background: UNDO_LINE_BACKGROUND_COLOR,
        boxShadow: isOlder ? undefined : UNDO_LINE_SHADOW,
        opacity: isOlder ? UNDO_LINE_OLDER_OPACITY : undefined,
        animation: UNDO_LINE_ANIMATION,
        fontSize: UNDO_LINE_FONT_SIZE_PX,
        letterSpacing: UNDO_LINE_LETTER_SPACING_PX,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          color: isOlder ? UNDO_LINE_OLDER_MESSAGE_COLOR : UNDO_LINE_MESSAGE_COLOR,
        }}
      >
        {message}
      </span>
      <TextButton
        tone={{
          rest: isOlder ? UNDO_LINE_OLDER_ACTION_COLOR : UNDO_LINE_ACTION_COLOR,
          lit: isOlder ? UNDO_LINE_OLDER_ACTION_COLOR : UNDO_LINE_ACTION_COLOR,
        }}
        onPress={onUndo}
      >
        {UNDO_ACTION_LABEL}
      </TextButton>
      <span
        style={{
          width: UNDO_LINE_SEPARATOR_WIDTH_PX,
          height: UNDO_LINE_SEPARATOR_HEIGHT_PX,
          background: isOlder ? UNDO_LINE_OLDER_BORDER_COLOR : UNDO_LINE_BORDER_COLOR,
        }}
      />
      <span
        style={{
          color: isOlder ? UNDO_LINE_OLDER_SECONDS_COLOR : UNDO_LINE_SECONDS_COLOR,
        }}
      >
        {secondsLeft} {UNDO_SECONDS_SUFFIX}
      </span>
    </div>
  );
}
