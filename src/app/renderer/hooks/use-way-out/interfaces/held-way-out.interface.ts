import type { WayOutAsk } from "./way-out-ask.type";

/** A way out standing still until the question is answered, and the voice that question speaks in. */
export interface HeldWayOut {
  run: () => void;
  ask: WayOutAsk;
}
