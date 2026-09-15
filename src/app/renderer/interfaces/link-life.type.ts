/**
 * How a line stands right now — work is flowing down it, its supplier has not had its turn
 * yet, its answer is in and held, or its supplier ended with nothing to hand on. A line in none of these has no life.
 */
export type LinkLife = "running" | "awaited" | "answered" | "silent";
