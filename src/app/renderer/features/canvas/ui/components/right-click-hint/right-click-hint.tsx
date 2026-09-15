import { Mark } from "../../../../../components";
import {
  CANVAS_EMPTY_GAP_PX,
  CANVAS_EMPTY_MOUSE_ACCENT_COLOR,
  CANVAS_EMPTY_MOUSE_COLOR,
  CANVAS_EMPTY_MOUSE_HEIGHT_PX,
  CANVAS_EMPTY_MOUSE_WIDTH_PX,
  CANVAS_EMPTY_NOTE_COLOR,
  CANVAS_EMPTY_NOTE_LETTER_SPACING_PX,
  CANVAS_EMPTY_NOTE_LINES,
  CANVAS_EMPTY_TEXT_GAP_PX,
  CANVAS_EMPTY_TITLE,
  CANVAS_EMPTY_TITLE_COLOR,
  CANVAS_EMPTY_TITLE_FONT_SIZE_PX,
  CANVAS_EMPTY_TITLE_LETTER_SPACING_PX,
} from "../../../constants";

/** Empty-canvas hint: mouse glyph with the right button lit, and two lines of instruction. */
export function RightClickHint() {
  return (
    <div
      className="d-flex flex-column align-items-center text-center"
      style={{
        gap: CANVAS_EMPTY_GAP_PX,
      }}
    >
      <svg width={CANVAS_EMPTY_MOUSE_WIDTH_PX} height={CANVAS_EMPTY_MOUSE_HEIGHT_PX} viewBox="0 0 32 44" fill="none">
        <path d="M16 2h1a13 13 0 0 1 13 13v5H16V2Z" fill={CANVAS_EMPTY_MOUSE_ACCENT_COLOR} opacity="0.85" />
        <rect x="2" y="2" width="28" height="40" rx="14" stroke={CANVAS_EMPTY_MOUSE_COLOR} strokeWidth="1.6" />
        <path d="M16 2v18M2.6 20h26.8" stroke={CANVAS_EMPTY_MOUSE_COLOR} strokeWidth="1.4" />
      </svg>
      <div
        className="d-flex flex-column align-items-center"
        style={{
          gap: CANVAS_EMPTY_TEXT_GAP_PX,
        }}
      >
        <Mark
          color={CANVAS_EMPTY_TITLE_COLOR}
          size={CANVAS_EMPTY_TITLE_FONT_SIZE_PX}
          spacing={CANVAS_EMPTY_TITLE_LETTER_SPACING_PX}
        >
          {CANVAS_EMPTY_TITLE}
        </Mark>
        <Mark
          color={CANVAS_EMPTY_NOTE_COLOR}
          spacing={CANVAS_EMPTY_NOTE_LETTER_SPACING_PX}
          className="d-flex flex-column"
        >
          {CANVAS_EMPTY_NOTE_LINES.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </Mark>
      </div>
    </div>
  );
}
