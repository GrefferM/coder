import type { MachineVoice } from "../../../../../interfaces";

export interface VoicePickerProps {
  voices: MachineVoice[];
  /** The chosen voice by name; `null` while none is. */
  voiceName: string | null;
  onChange: (voiceName: string) => void;
  onListen: () => void;
}
