import type { Agent } from "../../../../../../interfaces";
import type { SphereActs } from "./sphere-acts.interface";
import type { SphereDoing } from "./sphere-doing.interface";
import type { SpherePlace } from "./sphere-place.interface";
import type { SphereWearing } from "./sphere-wearing.interface";

export interface AgentSphereProps {
  agent: Agent;
  place: SpherePlace;
  wearing: SphereWearing;
  doing: SphereDoing;
  acts: SphereActs;
}
