import { Mark, TextButton } from "../../../../components";
import { WIDGET_LIST_CHECK_COLOR, WIDGET_NOTE_COLOR, WIDGET_NOTE_GAP_PX, WIDGET_NOTE_PADDING } from "../../constants";
import type { WidgetNoteProps } from "../../interfaces";

/** Why a question did not go or an answer was not read (52j): the app's line, with its act where it has one. */
export function WidgetNote({ note }: WidgetNoteProps) {
  return (
    <span
      role="status"
      className="d-flex flex-wrap align-items-center flex-shrink-0"
      style={{
        padding: WIDGET_NOTE_PADDING,
        gap: WIDGET_NOTE_GAP_PX,
      }}
    >
      <Mark color={WIDGET_NOTE_COLOR} isUpperCase={false}>
        {note.words}
      </Mark>
      {note.act !== null && (
        <TextButton
          tone={{
            rest: WIDGET_LIST_CHECK_COLOR,
            lit: WIDGET_LIST_CHECK_COLOR,
          }}
          onPress={note.act.onPress}
        >
          {note.act.label}
        </TextButton>
      )}
    </span>
  );
}
