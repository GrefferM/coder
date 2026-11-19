import type { SpeechReach } from "./speech-reach.interface";

/** What speech is built on: the providers' keys and addresses, where this machine's settings lie, and Coder Hearing. */
export interface SpeechModuleParts {
  reach: SpeechReach;
  userDataDirectory: string;
  hearingAppPath: string;
}
