import { useCallback, useEffect, useState } from "react";
import { WIDGET_NOTE_FADE_MS } from "../../constants";
import type { SpeechNote } from "../../../speech";
import type { WidgetNoteState } from "../../interfaces";

/** The widget's one line (52j): a note without an act goes after a while, one with an act stands until it is pressed. */
export function useWidgetNote(): WidgetNoteState {
  const [note, setNote] = useState<SpeechNote | null>(null);

  useEffect(() => {
    if (note === null || note.act !== null) {
      return;
    }

    const fading = window.setTimeout(() => setNote(null), WIDGET_NOTE_FADE_MS);

    return () => window.clearTimeout(fading);
  }, [note]);

  const say = useCallback((said: SpeechNote) => {
    setNote({
      words: said.words,
      act:
        said.act === null
          ? null
          : {
              label: said.act.label,
              onPress: () => {
                setNote(null);
                said.act?.onPress();
              },
            },
    });
  }, []);

  return {
    note,
    say,
  };
}
