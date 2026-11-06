import type { SpeechSettings } from "../../../../../contracts";
import type { MachineVoice } from "./machine-voice.interface";

/** What this machine speaks and hears with, the voices its OS has, and the one way to change the settings. */
export interface SpeechState {
  settings: SpeechSettings;
  voices: MachineVoice[];
  /** Writes what changed over the settings as they stand, so two changes in a row both stay. */
  save: (change: Partial<SpeechSettings>) => Promise<void>;
}
