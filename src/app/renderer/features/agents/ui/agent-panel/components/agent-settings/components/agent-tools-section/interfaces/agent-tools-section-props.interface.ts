import type { Agent, ToolGrant } from "../../../../../../../../../interfaces";

/** One agent's tab, the agents-as-tools field: every other sphere, and the grants of them this one holds. */
export interface AgentToolsSectionProps {
  /** Every agent of the project; the one being edited is left out of the choices by its id. */
  agents: Agent[];
  /** The agent being edited, so it is not offered itself; nothing while a sphere is being made. */
  selfId: string | null;
  grants: ToolGrant[];
  /** The agents-as-tools line as it was saved, or nothing where it stands unchanged. */
  wasValue: string | null;
  /** A provider that carries no function calls shuts the picker; the grants already given stay listed. */
  isLocked: boolean;
  onGrantsChange: (grants: ToolGrant[]) => void;
}
