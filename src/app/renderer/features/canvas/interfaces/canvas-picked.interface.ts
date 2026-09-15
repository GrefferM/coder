import type { PastedAgent } from "../../../interfaces";
import type { PendingPlacement } from "../../../interfaces";

/** What the person has singled out or is in the middle of doing — nothing here is saved in the project. */
export interface CanvasPicked {
  selectedAgentId: string | null;
  /** The agent the chat writes to — its halo breathes, and nothing else on the sphere or its lines does. */
  aimedAgentId: string | null;
  /** The panel is about the selected agent — the rest stands back and its lines take its colour. */
  isPanelOnAgent: boolean;
  pending: PendingPlacement | null;
  dimmedModelId: string | null;
  doomedAgentId: string | null;
  pasted: PastedAgent | null;
  isPasteOffered: boolean;
}
