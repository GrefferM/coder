import {
  AGENT_ASKED_SLOT,
  AGENT_CEILING_SLOT,
  AGENT_LIMIT_SLOT,
  AGENT_MEMORY_SLOT,
  AGENT_MODEL_SLOT,
  AGENT_NAME_SLOT,
  AGENT_PROMPT_SLOT,
  AGENT_RESERVED_NOTE,
  AGENT_RESERVE_SLOT,
  AGENT_TOO_LONG_NOTE,
  AGENT_TOTAL_SLOT,
  AGENT_WORDS_SLOT,
} from "../constants";
import { OVER_CEILING_CHARACTER_FORMS, groupedNumber, ukrainianPlural } from "../../../contracts";
import type { TurnLength } from "../../../contracts";

/**
 * Why a call of an agent as a tool does not begin, told to its caller: its words leave its memory no room below the
 * threshold (where a reserve is held back), or all of it is longer than its model takes. The counted lengths are
 * grouped; the ceiling goes as the person wrote it.
 */
export function toolWallNote(
  agent: { name: string; model: string },
  length: TurnLength,
  reserve: number,
  limit: number,
): string {
  if (reserve > 0) {
    const words = length.prompt + length.asked;
    const [one, few, many] = OVER_CEILING_CHARACTER_FORMS;

    return AGENT_RESERVED_NOTE.replace(AGENT_NAME_SLOT, agent.name)
      .replace(AGENT_WORDS_SLOT, `${groupedNumber(words)} ${ukrainianPlural(words, one, few, many)}`)
      .replace(AGENT_RESERVE_SLOT, groupedNumber(reserve))
      .replace(AGENT_LIMIT_SLOT, groupedNumber(limit))
      .replace(AGENT_MODEL_SLOT, agent.model)
      .replace(AGENT_CEILING_SLOT, String(length.ceiling));
  }

  return AGENT_TOO_LONG_NOTE.replace(AGENT_NAME_SLOT, agent.name)
    .replace(AGENT_MODEL_SLOT, agent.model)
    .replace(AGENT_TOTAL_SLOT, String(length.total))
    .replace(AGENT_PROMPT_SLOT, String(length.prompt))
    .replace(AGENT_MEMORY_SLOT, String(length.memory))
    .replace(AGENT_ASKED_SLOT, String(length.asked))
    .replace(AGENT_CEILING_SLOT, String(length.ceiling));
}
