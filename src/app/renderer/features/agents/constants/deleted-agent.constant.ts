/** First half of the undo line, always present. */
export const DELETED_AGENT_LABEL = "АГЕНТА ВИДАЛЕНО";

/** The closing word after the removed-links count. */
export const DELETED_LINKS_SUFFIX = "ПРИБРАНО";

/** The shape of every deletion question: «Заберемо ‹річ›. ‹Що піде або лишиться разом›.» */
export const DELETED_AGENT_NOTE_PREFIX = "Заберемо сферу ";
export const DELETED_AGENT_NOTE_LINKS = " і її зв'язки.";
export const DELETED_AGENT_NOTE_ALONE = ". Вона ні з ким не зв'язана.";
export const DELETED_AGENT_NOTE_LAST_JOIN = " і ";
export const DELETED_AGENT_NOTE_SEPARATOR = ", ";
export const DELETED_AGENT_NOTE_ONE_TAIL = "лишиться сам по собі.";
export const DELETED_AGENT_NOTE_MANY_TAIL = "лишаться, кожен сам по собі.";

/** The agent's schedules, in a sentence of their own at the end of the note (44d); up to ten said as a word. */
export const DELETED_AGENT_SCHEDULE_COUNT_WORDS = [
  "Один",
  "Два",
  "Три",
  "Чотири",
  "П'ять",
  "Шість",
  "Сім",
  "Вісім",
  "Дев'ять",
  "Десять",
];
export const DELETED_AGENT_SCHEDULE_FORMS = ["розклад", "розклади", "розкладів"];
export const DELETED_AGENT_SCHEDULE_VERB_FORMS = ["лишиться", "лишаться", "лишаться"];
export const DELETED_AGENT_SCHEDULE_HER = "її";
export const DELETED_AGENT_SCHEDULE_TAIL = "без агента.";
