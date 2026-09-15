/**
 * A press on the agent's own sphere, as the panel hears it. Whatever step the agent's tab stood on — a
 * grant, a server's functions — it stands back at its root on this press: the sphere is the agent itself, and the
 * agent itself is the settings.
 *
 * It is an object rather than a name because every press is its own event: the same sphere pressed twice must
 * bring the tab back twice, and two equal names would have looked like nothing happening at all.
 */
export interface AgentPress {
  /** The agent whose sphere was pressed, by its own id. */
  agentId: string;
}
