import type { VoiceStanding } from "../../../../../../../../speech";

export interface VoiceRowProps {
  /** Recording or being heard; the row has nothing to say while idle. */
  standing: Exclude<VoiceStanding, "idle">;
  /** When the recording began, for its clock. */
  startedAt: number;
  /** The loudness of the recording's latest moments, for the running wave. */
  levels: number[];
  onCancel: () => void;
}
