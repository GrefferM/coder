import type { Agent } from "../../../interfaces";

/** The agent as the settings tab edits it, unsaved until «Зберегти». */
export type AgentDraft = Omit<Agent, "id" | "x" | "y">;
