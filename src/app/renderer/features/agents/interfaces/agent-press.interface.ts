/**
 * A press on the agent's own sphere, which returns the tab to the agent's settings root.
 *
 * An object, not a name, so pressing twice is two events.
 */
export interface AgentPress {
  agentId: string;
}
