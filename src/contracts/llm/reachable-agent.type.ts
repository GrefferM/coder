import type { ReadyAgent } from "./ready-agent.interface";
import type { UnreadyAgent } from "./unready-agent.interface";

/** One agent reachable as a tool from the one being asked; `notReady` tells the two apart. */
export type ReachableAgent = ReadyAgent | UnreadyAgent;
