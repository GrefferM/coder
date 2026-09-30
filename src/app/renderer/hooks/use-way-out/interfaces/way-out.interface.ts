import type { UnsavedWork } from "../../../interfaces";
import type { WayOutAsk } from "./way-out-ask.type";

/** The gate and the three answers to its question. */
export interface WayOut {
  isHeld: boolean;
  ask: WayOutAsk;
  unsaved: UnsavedWork | null;
  guard: (wayOut: () => void, ask?: WayOutAsk) => void;
  saveAndLeave: () => Promise<void>;
  discardAndLeave: () => void;
  stay: () => void;
}
