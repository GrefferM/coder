import type { PastedAgent } from "../../../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** The agent held in hand for copying, and the copy just put down. */
export interface AgentClipboard {
  /** The copy just put down, so the sphere can say whose it is; null once the mark is taken off. */
  pasted: PastedAgent | null;
  /** Whether there is a copy to put down — the act stands dimmed while there is none. */
  isPasteOffered: boolean;
  copy: (agentId: string) => void;
  /** Hands back the id of the copy put down, so the page can select it; null where there was nothing to put. */
  putCopyAt: (at: Point) => Promise<string | null>;
  /** ⌘V with no point of its own: the copy stands on the first free place beside its original. */
  pasteBesideSource: () => Promise<string | null>;
  dismissPasted: () => void;
}
