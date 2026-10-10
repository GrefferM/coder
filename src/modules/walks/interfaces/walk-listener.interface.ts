import type { ProviderHeard, WalkState } from "../../../contracts";

/** Who hears what happens to a conversation: its walks changing, its record written, a provider heard. */
export interface WalkListener {
  changed(state: WalkState): void;
  written(): void;
  heard(heard: ProviderHeard): void;
}
