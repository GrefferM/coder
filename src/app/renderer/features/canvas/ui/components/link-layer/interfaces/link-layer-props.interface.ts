import type { Agent, Link, LinkLife } from "../../../../../../interfaces";
import type { Point } from "../../../../../../utils/math";

export interface LinkLayerProps {
  links: Link[];
  /** How every line stands right now; one with no life is not in it. */
  linkLives: Record<string, LinkLife>;
  agents: Agent[];
  /** Where each end that names nobody stands, by the id the line carries (50a). */
  deadEnds: Record<string, Point>;
  selectedAgentId: string | null;
  selectedLinkId: string | null;
  doomedAgentId: string | null;
  draggedAgentId?: string;
  draggedAt?: { x: number; y: number };
  onSelectLink: (linkId: string) => void;
}
