import type { SphereOrb } from "./sphere-orb.interface";

export interface SphereOrbsProps<Orb extends SphereOrb = SphereOrb> {
  /** What the agent is armed with, already cut to the arc's places. */
  orbs: Orb[];
  /** The canvas's own scale, so the target holds its size on the screen while the drawing shrinks. */
  scale?: number;
  /** The arc goes quiet with the sphere it belongs to, since it is a part of the same agent. */
  isDimmed?: boolean;
  /**
   * A press hands back the very mark that was pressed — not a name of it — and the mark's own button, because a
   * window opened from it is bound to that mark: it stands over it, and Escape gives the focus back to it.
   */
  onPress?: (orb: Orb, at: HTMLElement) => void;
  /**
   * The pointer came to rest on this mark, or the keyboard did. It hands back the same two things a press does,
   * because what opens on a mark opens the same way whichever brought the hand there.
   */
  onPointTo?: (orb: Orb, at: HTMLElement) => void;
  /** The pointer left the mark. What it raised does not go at once — the hand may be on its way into it. */
  onPointAway?: () => void;
}
