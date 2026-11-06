/** What this machine speaks with; `null` until the person chooses. */
export interface SpeechSettings {
  /** The OS voice an answer is read with, by its name. */
  voiceName: string | null;
}
