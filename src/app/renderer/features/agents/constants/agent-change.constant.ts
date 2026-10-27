import type { AgentMemory } from "../../../interfaces";

/** How the ask names each moved field. */
export const AGENT_NAME_CHANGE_LABEL = "назва";
export const AGENT_MODEL_CHANGE_LABEL = "модель";
export const AGENT_COLOR_CHANGE_LABEL = "колір";
export const AGENT_ACTIVE_CHANGE_LABEL = "стан";
export const AGENT_ACTIVE_ON_LABEL = "увімкнено";
export const AGENT_ACTIVE_OFF_LABEL = "вимкнено";

/** The same names as objects, for «Скидаємо назву й колір до записаного». */
export const AGENT_NAME_DROPPED_LABEL = "назву";
export const AGENT_MODEL_DROPPED_LABEL = "модель";
export const AGENT_COLOR_DROPPED_LABEL = "колір";
export const AGENT_ACTIVE_DROPPED_LABEL = "стан";

/** Prompt field name, and the label for having none. */
export const AGENT_PROMPT_CHANGE_LABEL = "промпт";
export const AGENT_PROMPT_DROPPED_LABEL = "промпт";
export const AGENT_NO_PROMPT_LABEL = "без промпта";
/** The name of a model field whose model lost its file. */
export const AGENT_LOST_MODEL_NAME = "моделі немає";
/** The name of a prompt field whose prompt lost its file. */
export const AGENT_LOST_PROMPT_NAME = "промпта немає";

/** Names for the run-reach fields. */
export const AGENT_MAX_CALLS_CHANGE_LABEL = "максимум викликів";
export const AGENT_MAX_CALLS_DROPPED_LABEL = "максимум викликів";
export const AGENT_TEMPERATURE_CHANGE_LABEL = "температура";
export const AGENT_TEMPERATURE_DROPPED_LABEL = "температура";

/** The four tool fields, named as their heads on the tab. */
export const AGENT_COMMANDS_CHANGE_LABEL = "команди";
export const AGENT_COMMANDS_DROPPED_LABEL = "команди";
export const AGENT_MCP_CHANGE_LABEL = "MCP";
export const AGENT_MCP_DROPPED_LABEL = "MCP";
export const AGENT_AGENTS_CHANGE_LABEL = "агенти";
export const AGENT_AGENTS_DROPPED_LABEL = "агенти";
export const AGENT_SYSTEM_CHANGE_LABEL = "системні";
export const AGENT_SYSTEM_DROPPED_LABEL = "системні";

/** The converging-wait mode, as a moved field says it. */
export const AGENT_WAIT_CHANGE_LABEL = "очікування";
export const AGENT_WAIT_DROPPED_LABEL = "очікування";
export const AGENT_WAIT_ON_LABEL = "чекає всіх";
export const AGENT_WAIT_OFF_LABEL = "на кожному окремо";

/** The memory, as a moved field says it. */
export const AGENT_MEMORY_CHANGE_LABEL = "пам'ять";
export const AGENT_MEMORY_DROPPED_LABEL = "пам'ять";
export const AGENT_MEMORY_WORDS: Record<AgentMemory, string> = {
  own: "своя",
  none: "вимкнена",
  shared: "загальна",
};

/** The memory's compression: the share of the ceiling it starts at, and the share it is written down to. */
export const AGENT_COMPRESS_AT_CHANGE_LABEL = "поріг стиснення";
export const AGENT_COMPRESS_AT_DROPPED_LABEL = "поріг стиснення";
export const AGENT_COMPRESS_TO_CHANGE_LABEL = "ціль стиснення";
export const AGENT_COMPRESS_TO_DROPPED_LABEL = "ціль стиснення";

/** The purpose line, as a moved field says it. */
export const AGENT_PURPOSE_CHANGE_LABEL = "опис";
export const AGENT_PURPOSE_DROPPED_LABEL = "опис";
