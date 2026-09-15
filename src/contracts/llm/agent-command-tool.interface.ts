import type { AgentToolParameter } from "./agent-tool-parameter.interface";

/** One declared command an agent may call; `parameters` holds the open ones, `pinned` the fixed. */
export interface AgentCommandTool {
  source: "command";
  name: string;
  description: string;
  run: string;
  parameters: AgentToolParameter[];
  pinned: Record<string, string>;
}
