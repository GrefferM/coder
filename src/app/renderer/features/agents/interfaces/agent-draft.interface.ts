import type { Agent } from "../../../interfaces";

/** The agent as the settings tab edits it; held unsaved until written by «Зберегти». */
export type AgentDraft = Omit<Agent, "id" | "x" | "y">;
