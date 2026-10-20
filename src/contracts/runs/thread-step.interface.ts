import type { WholeStep } from "./whole-step.interface";

/** What an agent's own thread needs of a step: whose it was, where and how it ended, and the words both ways. */
export type ThreadStep = Pick<WholeStep, "agentId" | "place" | "state" | "asked" | "said">;
