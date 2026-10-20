import type { RefObject } from "react";
import type { AgentDraft, WasAgent } from "../../../../../../../interfaces";

export interface MemoryNumbersProps {
  draft: AgentDraft;
  /** What each of these was before the draft changed it. */
  was: WasAgent;
  /** The stepper a mended card points at, focused on open. */
  mendedStepper: RefObject<HTMLButtonElement | null>;
  mendedRow: "compressAt" | "compressTo" | null;
  onDraftChange: (patch: Partial<AgentDraft>) => void;
}
