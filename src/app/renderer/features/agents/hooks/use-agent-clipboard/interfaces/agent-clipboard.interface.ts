import type { PastedAgent } from "../../../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** The agent held for copying, and the copy just pasted. */
export interface AgentClipboard {
  /** The copy just pasted; null once its mark is taken off. */
  pasted: PastedAgent | null;
  isPasteOffered: boolean;
  copy: (agentId: string) => void;
  /** Id of the pasted copy; null when nothing was pasted. */
  putCopyAt: (at: Point) => Promise<string | null>;
  /** ⌘V without a point: the copy goes on the first free place beside its original. */
  pasteBesideSource: () => Promise<string | null>;
  dismissPasted: () => void;
}
