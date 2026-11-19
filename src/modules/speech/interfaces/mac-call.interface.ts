import type { MacRecording } from "./mac-recording.interface";

/** One launch of Coder Hearing: its command, how long it may take, and the recording it hears, if any. */
export interface MacCall {
  command: string;
  waitMs: number;
  recording?: MacRecording;
}
