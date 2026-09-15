/** Shown in the agent's place when the local provider does not answer. */
export const CHAT_PROVIDER_SILENT_NOTE =
  "Локальний провайдер не відповідає за своєю адресою. Перевірте, чи він запущений.";

/** The app's own sentences about a turn; the row draws them in upper case, so they carry no full stop. */
export const CHAT_FAILED_NOTE = "Відповідь не прийшла";
export const CHAT_STOPPED_NOTE = "Зупинено";
export const CHAT_SAID_NOTHING_NOTE = "Модель не сказала нічого";

/**
 * What a broken step says when its turns ended differently; where they share an end, the rule says that end
 * instead.
 */
export const CHAT_STEP_BROKEN_NOTE = "Крок обірвався";

/** The ceiling on calls names its own number. */
export const CHAT_CALLS_EXHAUSTED_PREFIX = "Вичерпано максимум викликів";
export const CHAT_CALLS_EXHAUSTED_SEPARATOR = " · ";

/** The answer's ceiling names its own number too, in the tokens it is written in. */
export const CHAT_ANSWER_CEILING_PREFIX = "Відповідь уперлася в стелю";
export const CHAT_ANSWER_CEILING_UNIT = " ткн";
