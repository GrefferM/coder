import type { Agent, Link, LinkLife } from "../../../../../../interfaces";
import type { Point } from "../../../../../../utils/math";

export interface LinkLayerProps {
  links: Link[];
  /** How each line stands now; a line with no life is absent. */
  linkLives: Record<string, LinkLife>;
  agents: Agent[];
  /** Where each end that names nobody stands, by the id the line carries. */
  deadEnds: Record<string, Point>;
  selectedAgentId: string | null;
  selectedLinkId: string | null;
  doomedAgentId: string | null;
  draggedAgentId?: string;
  draggedAt?: { x: number; y: number };
  onSelectLink: (linkId: string) => void;
}
