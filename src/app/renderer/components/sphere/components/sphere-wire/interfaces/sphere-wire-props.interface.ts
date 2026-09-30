export interface SphereWireProps {
  /** The agent's colour, or the dead one when switched off. */
  accentColor: string;
  glowColor: string;
  ambientGlowColor: string;
  /** Only the aim breathes; an off agent has no light. */
  isBreathing: boolean;
  isPointedAt: boolean;
}
