import type { UnsavedWork } from "../../../interfaces";
import type { WayOutAsk } from "./way-out-ask.type";

/** The gate every way out of a panel passes through, and the three answers the question has. */
export interface WayOut {
  isHeld: boolean;
  ask: WayOutAsk;
  unsaved: UnsavedWork | null;
  guard: (wayOut: () => void, ask?: WayOutAsk) => void;
  saveAndLeave: () => Promise<void>;
  discardAndLeave: () => void;
  stay: () => void;
}
