import type { SphereOrb } from "./sphere-orb.interface";

export interface SphereOrbsProps<Orb extends SphereOrb = SphereOrb> {
  /** What the agent is armed with, already cut to the arc's places. */
  orbs: Orb[];
  /** The canvas scale, so the target keeps its on-screen size while the drawing shrinks. */
  scale?: number;
  /** Dims with the sphere it belongs to. */
  isDimmed?: boolean;
  /**
   * Nothing on the arc can be called because the model's provider protocol carries no functions; marks stay but take the
   * quiet tone.
   */
  isQuiet?: boolean;
  /**
   * A press hands back the pressed mark and its button; a window opened from it is bound to it and returns focus to it on
   * Escape.
   */
  onPress?: (orb: Orb, at: HTMLElement) => void;
  /** The pointer or keyboard came to rest on this mark; hands back the same two things as a press. */
  onPointTo?: (orb: Orb, at: HTMLElement) => void;
  /** The pointer left the mark; what it raised does not go at once, as the hand may be moving into it. */
  onPointAway?: () => void;
}
