import type { Agent } from "../../../../../interfaces";

export interface AimPickerProps {
  agents: Agent[];
  aimedAgentId: string | null;
  onAim: (agentId: string) => void;
}
