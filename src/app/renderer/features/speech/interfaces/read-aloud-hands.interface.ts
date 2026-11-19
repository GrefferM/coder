import type { SpeechNote } from "./speech-note.interface";

/** What a reading needs: the voice chosen by name, and where a reading with no voice says so. */
export interface ReadAloudHands {
  voiceName: string | null;
  /** How fast the voice reads; `null` reads at its own pace. */
  voiceRate: number | null;
  onNote: (note: SpeechNote) => void;
  onOpenSpeech: () => void;
}
