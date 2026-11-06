import type { SpeechNote } from "./speech-note.interface";

/** What a reading needs: the voice chosen by name, and where a reading with no voice says so. */
export interface ReadAloudHands {
  voiceName: string | null;
  onNote: (note: SpeechNote) => void;
  onOpenSpeech: () => void;
}
