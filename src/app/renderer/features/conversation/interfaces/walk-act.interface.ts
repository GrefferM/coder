import type { WalkEffect } from "./walk-effect.interface";

/** One named act of the machine, picked from everything it can ask for. */
export type WalkAct<Kind extends WalkEffect["kind"]> = Extract<WalkEffect, { kind: Kind }>;
