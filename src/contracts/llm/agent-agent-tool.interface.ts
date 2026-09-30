/** Another agent an agent may call as a tool: named by that agent's name, described by its short description. */
export interface AgentAgentTool {
  source: "agent";
  name: string;
  description: string;
  /** Which agent runs when this tool is called. */
  agentId: string;
}
