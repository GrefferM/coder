/** What this machine speaks and hears with; `null` until the person chooses. */
export interface SpeechSettings {
  /** The OS voice an answer is read with, by its name. */
  voiceName: string | null;
  /** The OS voice its Ukrainian sentences are read with instead; `null` reads them with `voiceName`. */
  ukrainianVoiceName: string | null;
  /** How fast the voice reads, 1 its own pace; `null` reads at its own pace. */
  voiceRate: number | null;
  /** How fast the Ukrainian voice reads, as `voiceRate`. */
  ukrainianVoiceRate: number | null;
  /** macOS hears on this machine, in every project, in place of the project's recognition model. */
  isMacHearing: boolean;
  /** The language macOS hears, as a locale (`en-US`). */
  macLocale: string | null;
  /** The other language the widget switches macOS to, swapping it with `macLocale`; `null` where there is none. */
  macSecondLocale: string | null;
}
