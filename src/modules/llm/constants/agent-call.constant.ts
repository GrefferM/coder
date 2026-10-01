/** The one parameter an agent is called with: a request in words. */
export const AGENT_TOOL_INPUT_NAME = "request";
export const AGENT_TOOL_INPUT_DESCRIPTION = "Запит або завдання для агента — те, на що він має відповісти.";

/** The slot every note below fills with the agent's name. */
export const AGENT_NAME_SLOT = "{name}";

/** The agent called is already running above this call; calling it would close a ring. */
export const AGENT_CYCLE_NOTE = "[агент «{name}» вже виконується вище — коло не замикаємо]";
/** The agent called did not travel with the ask. */
export const AGENT_GONE_NOTE = "[агента «{name}» вже немає в проєкті]";
/**
 * The request and memory are longer than the agent's model takes, so its turn did not begin: what would have gone, in
 * characters, part by part, against the ceiling. Nothing was cut.
 */
export const AGENT_TOO_LONG_NOTE =
  "[агент «{name}» не почав: у модель {model} пішло б символів: {total} (промпт {prompt}, пам'ять {memory}, запит {asked}), а стеля — {ceiling}. Нічого не обрізали.]";
/** The slots of the note above, besides the name. */
export const AGENT_MODEL_SLOT = "{model}";
export const AGENT_TOTAL_SLOT = "{total}";
export const AGENT_PROMPT_SLOT = "{prompt}";
export const AGENT_MEMORY_SLOT = "{memory}";
export const AGENT_ASKED_SLOT = "{asked}";
export const AGENT_CEILING_SLOT = "{ceiling}";
