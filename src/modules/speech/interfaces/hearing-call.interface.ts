import type { HeardSound } from "../../../contracts/speech";

/** One recording put to a provider: where, with which key, and the sound with its model. */
export interface HearingCall {
  address: string;
  key: string;
  sound: HeardSound;
}
