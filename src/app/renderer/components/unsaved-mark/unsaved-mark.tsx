import {
  UNSAVED_MARK_COLOR,
  UNSAVED_MARK_DOT_SIZE_PX,
  UNSAVED_MARK_FONT_SIZE_PX,
  UNSAVED_MARK_GAP_PX,
  UNSAVED_MARK_LABEL,
  UNSAVED_MARK_LETTER_SPACING_PX,
} from "./constants";

/** «● НЕ ЗБЕРЕЖЕНО» beside the name of a thing with unsaved work. */
export function UnsavedMark() {
  return (
    <span
      className="d-flex align-items-center flex-shrink-0"
      style={{
        gap: UNSAVED_MARK_GAP_PX,
      }}
    >
      <span
        style={{
          width: UNSAVED_MARK_DOT_SIZE_PX,
          height: UNSAVED_MARK_DOT_SIZE_PX,
          borderRadius: "50%",
          background: UNSAVED_MARK_COLOR,
        }}
      />
      <span
        className="font-monospace"
        style={{
          color: UNSAVED_MARK_COLOR,
          fontSize: UNSAVED_MARK_FONT_SIZE_PX,
          letterSpacing: UNSAVED_MARK_LETTER_SPACING_PX,
        }}
      >
        {UNSAVED_MARK_LABEL}
      </span>
    </span>
  );
}
