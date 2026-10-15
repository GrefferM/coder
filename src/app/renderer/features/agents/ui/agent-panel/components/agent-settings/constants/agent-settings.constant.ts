/** Field column under the header. */
export const AGENT_SETTINGS_BODY_PADDING_PX = 18;
export const AGENT_SETTINGS_BODY_GAP_PX = 18;
export const AGENT_SETTINGS_NAME_LABEL = "НАЗВА";

/** What the agent is for; read by another agent when this one is its tool. */
export const AGENT_SETTINGS_PURPOSE_LABEL = "КОРОТКИЙ ОПИС";
export const AGENT_SETTINGS_PURPOSE_PLACEHOLDER =
  "Що робить агент — це побачить той, хто підключить його як інструмент";
export const AGENT_SETTINGS_MODEL_LABEL = "МОДЕЛЬ";
export const AGENT_SETTINGS_COLOR_LABEL = "КОЛІР";

export const AGENT_SETTINGS_SWITCH_LABEL = "Увімкнено";

/** The converging-wait toggle and the line under it. */
export const AGENT_SETTINGS_WAIT_LABEL = "Очікувати всіх";
export const AGENT_SETTINGS_WAIT_HINT = "УВІМК — ЧЕКАЄ ВСІХ, ХТО СХОДИТЬСЯ · ВИМК — НА КОЖНОМУ ВХОДІ ОКРЕМО";

/** Footer actions; the first is «Видалити» until the draft changes, then «Скасувати». */
export const AGENT_SETTINGS_FOOTER_BORDER_COLOR = "#1c202c";
export const AGENT_SETTINGS_ACTION_GAP_PX = 10;
export const AGENT_SETTINGS_DELETE_LABEL = "Видалити";
export const AGENT_SETTINGS_REVERT_LABEL = "Скасувати";
export const AGENT_SETTINGS_SAVE_LABEL = "Зберегти";

export const AGENT_SETTINGS_PROMPT_LABEL = "ПРОМПТ";
/** Gap between a field and the broken tie under it. */
export const AGENT_SETTINGS_TIE_GAP_PX = 8;

/** Per-agent call limit: tool calls one turn may make. */
export const AGENT_SETTINGS_MAX_CALLS_LABEL = "Максимум викликів";

/** Zero means no ceiling: the stepper shows «∞» and a line under the row says so. */
export const AGENT_SETTINGS_MAX_CALLS_UNLIMITED = "∞";
export const AGENT_SETTINGS_MAX_CALLS_HINT = "0 — БЕЗ ЛІМІТУ";

/** The temperature row and the line under it, in plain words. */
export const AGENT_SETTINGS_TEMPERATURE_LABEL = "Температура";
export const AGENT_SETTINGS_TEMPERATURE_HINT = "0 — СТРОГО ФОРМУЛЮЄ · 1 — ВІЛЬНІШЕ ФОРМУЛЮЄ · КРОК 0.1";

/** Both tab steps (grant, server) go back to the settings root. */
export const SETTINGS_BACK_LABEL = "Назад до налаштувань";
