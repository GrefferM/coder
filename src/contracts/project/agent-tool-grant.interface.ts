/** Another agent granted as a tool; its name and description are that agent's own. */
export interface AgentToolGrant {
  id: string;
  source: "agent";
  agentId: string;
}
