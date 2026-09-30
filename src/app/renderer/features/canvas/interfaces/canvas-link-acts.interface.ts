/** Every act on a line between two spheres. */
export interface CanvasLinkActs {
  onAdd: (fromAgentId: string, toAgentId: string) => void;
  onDelete: (linkId: string) => void;
  /** The chosen link, so a destructive key can be routed to it. */
  onChosenChange: (linkId: string | null) => void;
}
