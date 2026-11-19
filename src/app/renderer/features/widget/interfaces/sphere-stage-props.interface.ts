import type { Agent, Link } from "../../../interfaces";

export interface SphereStageProps {
  /** The chosen agent; `null` leaves the sphere empty and grey (52b, 52c). */
  agent: Agent | null;
  links: Link[];
  /** The microphone's loudness now, from 0 to 1, while it records; `null` while it does not. */
  level: number | null;
  /** A walk is out or an end is read: the sphere shimmers (52e, 52f). */
  isShimmering: boolean;
}
