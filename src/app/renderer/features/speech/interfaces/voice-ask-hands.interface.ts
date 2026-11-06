import type { HearingChoice } from "./hearing-choice.interface";
import type { SpeechNote } from "./speech-note.interface";
import type { HeardClip } from "./heard-clip.interface";

/** What a spoken question needs of the page: who hears it, and where its words and refusals go. */
export interface VoiceAskHands {
  /** The model the project hears with; `null` while none stands, and a press says so and records nothing. */
  hearing: HearingChoice | null;
  /** The words heard, to be written into the field, and the recording they were heard in, to go under it. */
  onHeard: (words: string, clip: HeardClip) => void;
  onNote: (note: SpeechNote) => void;
  onOpenSpeech: () => void;
}
