import type { Agent } from "../../../../../../../interfaces";

export interface AgentFieldProps {
  label: string;
  agents: Agent[];
  agentId: string | null;
  placeholder: string;
  isInvalid: boolean;
  onChange: (agentId: string) => void;
}
