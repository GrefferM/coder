/** Where a spoken question stands: nothing out, recording, or being heard by the provider. */
export type VoiceStanding = "idle" | "recording" | "hearing";

/** A spoken question as the field shows it, and its two hands. */
export interface VoiceAsk {
  standing: VoiceStanding;
  /** When the recording began, for its clock; `0` while none is made. */
  startedAt: number;
  /** The loudness of the latest moments of the recording being made, oldest first; empty while none is made. */
  levels: number[];
  /** The microphone: begins a recording, or ends the one being made. */
  press: () => void;
  /** «СКАСУВАТИ»: drops the recording, the field untouched. */
  cancel: () => void;
}
