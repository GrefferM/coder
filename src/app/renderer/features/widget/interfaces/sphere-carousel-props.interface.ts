import type { Agent } from "../../../interfaces";

export interface SphereCarouselProps {
  agents: Agent[];
  chosenAgentId: string | null;
  onChoose: (agentId: string) => void;
}
