import { LOST_TIE_NOTE_COLOR, LOST_TIE_NOTE_FONT_SIZE_PX, LOST_TIE_NOTE_LINE_HEIGHT } from "./constants";
import type { LostNoteProps } from "./interfaces";

/**
 * The sentence that says what is gone. It stands on its own because a group can hold more than
 * one reason — «Сервер оновився й забрав цю функцію» and «Команди більше немає у проєкті» are two sentences over
 * one group, and each belongs under its own rows.
 */
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
