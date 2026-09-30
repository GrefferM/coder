import { brokenCause } from "../../../logic";
import type { GrantTargets } from "../../../interfaces";
import type { ToolGrant } from "../../../interfaces";

/**
 * The number on the trail's key: how many functions the agent can call, all sources together, a declared command
 * counting as one (as in the panel). Grants pointing at nothing are not counted.
 */
export function armedTally(tools: ToolGrant[], said: GrantTargets): number {
  return tools.filter((grant) => brokenCause(grant, said) === null).length;
}
