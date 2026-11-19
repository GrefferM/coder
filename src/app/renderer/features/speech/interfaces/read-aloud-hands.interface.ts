import type { SpeechNote } from "./speech-note.interface";

/** What a reading needs: the voice chosen by name, and where a reading with no voice says so. */
export interface ReadAloudHands {
  voiceName: string | null;
  /** The voice Ukrainian sentences are read with; `null` reads them with `voiceName`. */
  ukrainianVoiceName: string | null;
  /** How fast the voice reads; `null` reads at its own pace. */
  voiceRate: number | null;
  /** How fast the Ukrainian voice reads; `null` reads at its own pace. */
  ukrainianVoiceRate: number | null;
  onNote: (note: SpeechNote) => void;
  onOpenSpeech: () => void;
}
