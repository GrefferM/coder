import type { Agent, Link, LinkLife } from "../../../../../../interfaces";

export interface LinkLayerProps {
  links: Link[];
  /** How every line stands right now; one with no life is not in it. */
  linkLives: Record<string, LinkLife>;
  agents: Agent[];
  selectedAgentId: string | null;
  selectedLinkId: string | null;
  doomedAgentId: string | null;
  draggedAgentId?: string;
  draggedAt?: { x: number; y: number };
  onSelectLink: (linkId: string) => void;
}
