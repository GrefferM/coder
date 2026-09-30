/** The one parameter an agent is called with: a request in words. */
export const AGENT_TOOL_INPUT_NAME = "request";
export const AGENT_TOOL_INPUT_DESCRIPTION = "Запит або завдання для агента — те, на що він має відповісти.";

/** The slot every note below fills with the agent's name. */
export const AGENT_NAME_SLOT = "{name}";

/** The agent called is already running above this call; calling it would close a ring. */
export const AGENT_CYCLE_NOTE = "[агент «{name}» вже виконується вище — коло не замикаємо]";
/** The agent called did not travel with the ask. */
export const AGENT_GONE_NOTE = "[агента «{name}» вже немає в проєкті]";
/** The agent was asked and could not run to an answer. */
export const AGENT_FELL_NOTE = "[агент «{name}» не зміг виконатися як інструмент]";
