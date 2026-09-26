import { isModelFilled } from "../../../logic";
import type { AgentStands } from "../interfaces";

/**
 * How far a question's attachments may be read: the ceiling of the model its agent is asked with. Where no model
 * can be asked — none chosen, or one with a number missing — the turn meets its wall before the ceiling does, and
 * nothing need be read at all.
 */
export function packCeiling({ model }: AgentStands): number {
  return model !== null && isModelFilled(model) ? model.contextCeiling : 0;
}
