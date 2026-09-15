import type { WalkEffect } from "./walk-effect.interface";

/** One named act of the machine, picked out of everything it can ask for — the shape a hand is handed. */
export type WalkAct<Kind extends WalkEffect["kind"]> = Extract<WalkEffect, { kind: Kind }>;
