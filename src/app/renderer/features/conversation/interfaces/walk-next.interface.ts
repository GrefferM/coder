import type { WalkEffect } from "./walk-effect.interface";
import type { WalkState } from "./walk-state.interface";

/** What one event leaves behind — the walk as it now stands, and what it asks the world to do. */
export interface WalkNext {
  state: WalkState;
  effects: WalkEffect[];
}
