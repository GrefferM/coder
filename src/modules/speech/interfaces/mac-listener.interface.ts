import type { MacPermission } from "../../../contracts/speech";
import type { MacRecording } from "./mac-recording.interface";

/** macOS's own recognition on this machine: its permission, its languages, and one recording heard. */
export interface MacListener {
  permission(): Promise<MacPermission>;
  allow(): Promise<MacPermission>;
  locales(): Promise<string[]>;
  hear(recording: MacRecording): Promise<string>;
}
