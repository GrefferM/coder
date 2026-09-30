import { UndoLine } from "../undo-line";
import { CANVAS_LAYER } from "../../../../../constants";
import { UNDO_STACK_BOTTOM_PX, UNDO_STACK_FOLD_PREFIX, UNDO_STACK_GAP_PX, UNDO_STACK_SHOWN_MAX } from "./constants";
import {
  UNDO_LINE_BACKGROUND_COLOR,
  UNDO_LINE_BORDER_RADIUS_PX,
  UNDO_LINE_FONT_SIZE_PX,
  UNDO_LINE_LETTER_SPACING_PX,
  UNDO_LINE_OLDER_BORDER_COLOR,
  UNDO_LINE_OLDER_MESSAGE_COLOR,
  UNDO_LINE_OLDER_OPACITY,
  UNDO_LINE_PADDING,
} from "../undo-line/constants";
import type { UndoStackProps } from "./interfaces";

/** Every deletion's undo: newest at the bottom and lit, older ones above dimmer, each on its own clock. */
export function UndoStack({ offers, onUndo }: UndoStackProps) {
  const shown = offers.slice(-UNDO_STACK_SHOWN_MAX);
  const folded = offers.length - shown.length;

  return (
    <div
      className="d-flex flex-column align-items-center"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      role="presentation"
      style={{
        position: "absolute",
        left: "50%",
        bottom: UNDO_STACK_BOTTOM_PX,
        transform: "translateX(-50%)",
        zIndex: CANVAS_LAYER,
        gap: UNDO_STACK_GAP_PX,
      }}
    >
      {folded > 0 && (
        <span
          className="font-monospace text-uppercase"
          style={{
            padding: UNDO_LINE_PADDING,
            borderRadius: UNDO_LINE_BORDER_RADIUS_PX,
            border: `1px solid ${UNDO_LINE_OLDER_BORDER_COLOR}`,
            background: UNDO_LINE_BACKGROUND_COLOR,
            opacity: UNDO_LINE_OLDER_OPACITY,
            fontSize: UNDO_LINE_FONT_SIZE_PX,
            letterSpacing: UNDO_LINE_LETTER_SPACING_PX,
            color: UNDO_LINE_OLDER_MESSAGE_COLOR,
          }}
        >
          {UNDO_STACK_FOLD_PREFIX} {folded}
        </span>
      )}
      {shown.map((offer, index) => (
        <UndoLine
          key={offer.id}
          message={offer.message}
          secondsLeft={offer.secondsLeft}
          isOlder={index < shown.length - 1}
          onUndo={() => onUndo(offer.id)}
        />
      ))}
    </div>
  );
}
