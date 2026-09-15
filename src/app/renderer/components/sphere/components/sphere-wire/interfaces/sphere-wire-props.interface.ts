export interface SphereWireProps {
  /** The agent's own colour, or the dead one where it is switched off. */
  accentColor: string;
  glowColor: string;
  ambientGlowColor: string;
  /** The aim breathes and nothing else moves; an off agent has no light to breathe. */
  isBreathing: boolean;
  isPointedAt: boolean;
}
