import type { MachineVoice } from "../../../../../interfaces";

export interface VoicePickerProps {
  /** The field's label: the voice of every answer, or of their Ukrainian sentences. */
  label: string;
  voices: MachineVoice[];
  /** The chosen voice by name; `null` while none is. */
  voiceName: string | null;
  /** Said in the field while none is chosen. */
  emptyWords: string;
  onChange: (voiceName: string) => void;
  /** «ПОСЛУХАТИ»; `null` where the field has none. */
  onListen: (() => void) | null;
}
