import { LOST_TIE_NOTE_COLOR, LOST_TIE_NOTE_FONT_SIZE_PX, LOST_TIE_NOTE_LINE_HEIGHT } from "./constants";
import type { LostNoteProps } from "./interfaces";

/** The sentence saying what is gone; a group with several reasons has one per reason, each under its own rows. */
export function LostNote({ children }: LostNoteProps) {
  return (
    <span
      style={{
        color: LOST_TIE_NOTE_COLOR,
        fontSize: LOST_TIE_NOTE_FONT_SIZE_PX,
        lineHeight: LOST_TIE_NOTE_LINE_HEIGHT,
      }}
    >
      {children}
    </span>
  );
}
