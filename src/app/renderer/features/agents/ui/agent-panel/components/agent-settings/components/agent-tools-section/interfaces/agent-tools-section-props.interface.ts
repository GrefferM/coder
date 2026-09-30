import type { Agent, ToolGrant } from "../../../../../../../../../interfaces";

/** The agents-as-tools field: every other agent, and this one's grants of them. */
export interface AgentToolsSectionProps {
  /** Every agent of the project; the edited one is left out by id. */
  agents: Agent[];
  /** The edited agent, not offered to itself; null while one is being made. */
  selfId: string | null;
  grants: ToolGrant[];
  /** The saved agents-as-tools line; null when unchanged. */
  wasValue: string | null;
  /** The provider has no function calls: the picker is shut, earlier grants stay listed. */
  isLocked: boolean;
  onGrantsChange: (grants: ToolGrant[]) => void;
}
