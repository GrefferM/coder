import type { RefObject } from "react";
import type { AgentDraft, WasAgent } from "../../../../../../../interfaces";

export interface SettingsNumbersProps {
  draft: AgentDraft;
  /** What each of these was before the draft changed it. */
  was: WasAgent;
  /** The stepper a mended card points at, focused on open. */
  mendedStepper: RefObject<HTMLButtonElement | null>;
  mendedRow: "maxCalls" | "temperature" | null;
  /** Two or more lines come in, so there is a wait to keep or give up. */
  isConverging: boolean;
  onDraftChange: (patch: Partial<AgentDraft>) => void;
}
