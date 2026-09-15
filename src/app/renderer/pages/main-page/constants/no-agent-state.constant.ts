import type { AgentState } from "../../../features/agents";

/**
 * The state of no agent at all — what the tab stands on while none is selected. It says nothing rather than
 * standing in for something: there is no agent here to be in any state, so every word of it is empty.
 */
export const NO_AGENT_STATE: AgentState = {
  label: "",
  color: "",
  mark: "dot",
  at: null,
};
