import type { VoiceAsk } from "../../speech";

export interface WidgetKeysHands {
  voice: VoiceAsk;
  /** A walk is out in the conversation. */
  isWalking: boolean;
  /** A dialog stands open and takes Escape for itself. */
  isAsked: boolean;
  onStopWalk: () => void;
  onStopReading: () => void;
}
