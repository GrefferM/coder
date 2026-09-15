/** Every act on a line between two spheres. */
export interface CanvasLinkActs {
  onAdd: (fromAgentId: string, toAgentId: string) => void;
  onDelete: (linkId: string) => void;
  /** Which link stands chosen, so the page knows a destructive key belongs to it. */
  onChosenChange: (linkId: string | null) => void;
}
