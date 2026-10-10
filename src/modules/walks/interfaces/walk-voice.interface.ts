import type { ProviderHeard, WalkSnapshot } from "../../../contracts";

/** Where the screen is told what happens to the conversation. */
export interface WalkVoice {
  changed(snapshot: WalkSnapshot): void;
  written(): void;
  heard(heard: ProviderHeard): void;
}
