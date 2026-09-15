import type { AgentState } from "../../../../../interfaces";

export interface AgentHeaderProps {
  name: string;
  color: string;
  isActive: boolean;
  state: AgentState;
  /** Start of the running turn; the state line counts from it. */
  startedAt: number | null;
}
