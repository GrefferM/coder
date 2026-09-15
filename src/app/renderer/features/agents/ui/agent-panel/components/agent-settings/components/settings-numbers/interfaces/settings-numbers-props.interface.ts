import type { RefObject } from "react";
import type { AgentDraft, WasAgent } from "../../../../../../../interfaces";

export interface SettingsNumbersProps {
  draft: AgentDraft;
  /** What each of these was before the draft changed it. */
  was: WasAgent;
  /** The stepper a mended card points at, so the panel opens with the eye already on it. */
  mendedStepper: RefObject<HTMLButtonElement | null>;
  mendedRow: "maxCalls" | "temperature" | null;
  onDraftChange: (patch: Partial<AgentDraft>) => void;
}
