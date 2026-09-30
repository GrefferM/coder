import type { Agent } from "../../../../../../interfaces";
import type { SphereActs } from "./sphere-acts.interface";
import type { SphereDoing } from "./sphere-doing.interface";
import type { SpherePlace } from "./sphere-place.interface";
import type { SphereWearing } from "./sphere-wearing.interface";

/**
 * One agent's sphere: the agent, and four parts: where it is drawn, what it wears, what it is doing, and every act on
 * it.
 */
export interface AgentSphereProps {
  agent: Agent;
  place: SpherePlace;
  wearing: SphereWearing;
  doing: SphereDoing;
  acts: SphereActs;
}
