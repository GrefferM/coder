import type { ProjectConfig } from "../../../interfaces";
import type { WalkEvent } from "./walk-event.interface";
import type { WalkNext } from "./walk-next.interface";
import type { WalkState } from "./walk-state.interface";

/** One named fact of the walk, picked from everything that can happen. */
export type WalkFact<Kind extends WalkEvent["kind"]> = Extract<WalkEvent, { kind: Kind }>;

/** The rule for one kind of fact: the walk as it stood, the fact, and the lines it stands on. */
export type WalkRule<Kind extends WalkEvent["kind"]> = (
  state: WalkState,
  event: WalkFact<Kind>,
  config: ProjectConfig,
) => WalkNext;

/**
 * Every fact answered by a rule of its own kind: a fact with no rule does not compile, and a rule cannot receive a fact
 * it was not written for.
 */
export type WalkRules = {
  [Kind in WalkEvent["kind"]]: WalkRule<Kind>;
};
