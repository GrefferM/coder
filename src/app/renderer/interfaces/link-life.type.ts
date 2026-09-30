/**
 * How a line stands now: work flowing, supplier not yet had its turn, answer in and held, or supplier ended with
 * nothing to hand on. Otherwise no life.
 */
export type LinkLife = "running" | "awaited" | "answered" | "silent";
