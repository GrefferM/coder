import type { AgentState } from "../../../features/agents";

/** The state of no agent: what the tab stands on while none is selected; every word is empty. */
export const NO_AGENT_STATE: AgentState = {
  label: "",
  color: "",
  mark: "dot",
  at: null,
};
