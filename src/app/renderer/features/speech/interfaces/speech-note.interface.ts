/** What a recording or a reading that did not go says on the app's line, and the act beside it; `null` where none. */
export interface SpeechNote {
  words: string;
  act: SpeechNoteAct | null;
}

/** The word of the act on the line, and what it does. */
export interface SpeechNoteAct {
  label: string;
  onPress: () => void;
}
