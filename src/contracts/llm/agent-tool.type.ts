import type { AgentCommandTool } from "./agent-command-tool.interface";
import type { AgentServerTool } from "./agent-server-tool.interface";

/** Everything an agent may call in a turn; `source` is the one field the turn branches on. */
export type AgentTool = AgentCommandTool | AgentServerTool;
