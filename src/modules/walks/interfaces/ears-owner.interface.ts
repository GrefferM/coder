import type { WalkListener } from "./walk-listener.interface";

/** Who knows which conversation is the open one. */
export interface EarsOwner {
  isHearing(ears: WalkListener): boolean;
}
