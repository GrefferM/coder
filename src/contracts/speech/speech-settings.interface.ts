/** What this machine speaks and hears with; `null` until the person chooses. */
export interface SpeechSettings {
  /** The OS voice an answer is read with, by its name. */
  voiceName: string | null;
  /** macOS hears on this machine, in every project, in place of the project's recognition model. */
  isMacHearing: boolean;
  /** The language macOS hears, as a locale (`en-US`). */
  macLocale: string | null;
}
