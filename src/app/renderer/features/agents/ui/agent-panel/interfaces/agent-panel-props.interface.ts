import type { AgentCatalogue, AgentPanelActs, AgentPresses, AgentStanding, AgentWriting } from "../../../interfaces";

/** An agent's tab in five parts: choices, what is written, how the agent stands, what sent the tab here, and acts. */
export interface AgentPanelProps {
  /** The selected agent's id, so its tab never offers it to itself as a tool. */
  agentId: string | null;
  catalogue: AgentCatalogue;
  writing: AgentWriting;
  standing: AgentStanding;
  presses: AgentPresses;
  acts: AgentPanelActs;
}
