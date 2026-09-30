import type { AgentTrouble } from "../../../../../../interfaces";
import type { SphereStanding } from "../../../../interfaces";
import type { GrantTargets } from "../../../../../../interfaces";
import type { SphereTrailProps } from "../../../../../../components/sphere/components/sphere-trail/interfaces";

/** What the sphere wears: how it stands among the rest, and every mark drawn on or under it. */
export interface SphereWearing {
  /** How it stands among the rest — chosen, aimed at, dimmed. */
  standing: SphereStanding;
  isActive: boolean;
  /** The colour of the dot beside its name. */
  stateColor: string;
  modelTitle: string | undefined;
  /** The pill it wears where something is missing; null while nothing is. */
  trouble: AgentTrouble | null;
  /** The trail's third line — whether a prompt stands, and how much this agent can call. */
  trail: SphereTrailProps;
  /** What the sources say of themselves — the words a mini-sphere shows under the cursor. */
  sources: GrantTargets;
  /** Nothing this agent is armed with can be called: its model's provider carries no functions at all. */
  isToolless: boolean;
}
