import type { RefObject } from "react";
import type { AgentDraft, WasAgent } from "../../../../../../../interfaces";

export interface SettingsNumbersProps {
  draft: AgentDraft;
  /** What each of these was before the draft changed it. */
  was: WasAgent;
  /** The stepper a mended card points at, so the panel opens with the eye already on it. */
  mendedStepper: RefObject<HTMLButtonElement | null>;
  mendedRow: "maxCalls" | "temperature" | null;
  /** Two lines or more come in, so there is a wait to keep or give up; with one there is nothing to wait for. */
  isConverging: boolean;
  onDraftChange: (patch: Partial<AgentDraft>) => void;
}
