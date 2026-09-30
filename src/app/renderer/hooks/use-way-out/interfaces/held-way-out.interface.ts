import type { WayOutAsk } from "./way-out-ask.type";

/** A way out held until the question is answered, and the voice of that question. */
export interface HeldWayOut {
  run: () => void;
  ask: WayOutAsk;
}
