import type { AgentRun } from "./agent-run.interface";
import type { MemorySettings } from "../project/memory-settings.type";

/**
 * An agent reachable as a tool that can run, with the run its call opens. What it keeps of its calls is `MemorySettings`:
 * its own thread of them within one turn of the caller, the question's shared memory, or none, and the threshold and
 * target its memory is compressed by.
 */
export type ReadyAgent = AgentRun &
  MemorySettings & {
    agentId: string;
    name: string;
    notReady: null;
    /** The context ceiling of its model, in characters, which the request and memory are weighed against. */
    contextCeiling: number;
    /** The prices of its model per million tokens, which its composer's calls are paid at. */
    inputPrice: number;
    outputPrice: number;
  };
