import type { AgentCatalogue, AgentPanelActs, AgentPresses, AgentStanding, AgentWriting } from "../../../interfaces";

/**
 * An agent's tab in five parts, each named after what owns it: what there is to choose from, what is being
 * written, how the agent stands, what sent the tab here, and what can be done.
 */
export interface AgentPanelProps {
  catalogue: AgentCatalogue;
  writing: AgentWriting;
  standing: AgentStanding;
  presses: AgentPresses;
  acts: AgentPanelActs;
}
