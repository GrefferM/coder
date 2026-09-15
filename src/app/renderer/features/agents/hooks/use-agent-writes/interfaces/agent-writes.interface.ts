import type { PastedAgent } from "../../../../../interfaces";
import type { AgentDraft } from "../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** What the canvas and the settings tab write about an agent. */
export interface AgentWrites {
  createAgent: (name: string, modelId: string, at: Point) => Promise<string>;
  saveAgent: (agentId: string, patch: Partial<AgentDraft>) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  pasteAgent: (sourceAgentId: string, at: Point) => Promise<PastedAgent | null>;
  moveAgent: (agentId: string, at: Point) => Promise<void>;
}
