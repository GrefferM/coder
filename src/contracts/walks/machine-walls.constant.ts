import { LLM_NO_ADDRESS, LLM_NO_KEY, LLM_PROVIDER_NOT_BUILT, LLM_PROVIDER_SILENT } from "../llm";
import type { MachineWall } from "./not-started-wall.type";

/**
 * A machine refusal code and the wall of the family it belongs to; the one place codes (the boundary's) and walls
 * (ours) are tied.
 */
export const MACHINE_WALLS: Record<string, MachineWall> = {
  [LLM_NO_KEY]: "noKey",
  [LLM_NO_ADDRESS]: "noAddress",
  [LLM_PROVIDER_SILENT]: "silent",
  [LLM_PROVIDER_NOT_BUILT]: "noProvider",
};
