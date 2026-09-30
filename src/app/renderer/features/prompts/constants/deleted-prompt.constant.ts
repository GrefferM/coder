/** Prompt-deletion question wording; its agents stay, left on the bare model. */
export const DELETED_PROMPT_QUESTION_PREFIX = "Видалити промпт «";
export const DELETED_PROMPT_QUESTION_SUFFIX = "»?";
/**
 * «Заберемо ‹річ›. ‹Що піде або лишиться разом›.»: the prompt named, then what its agents are left on; they stay, on
 * the bare model.
 */
export const DELETED_PROMPT_NOTE_PREFIX = "Заберемо промпт «";
export const DELETED_PROMPT_NOTE_NAMED = "». ";
export const DELETED_PROMPT_AGENT_FORMS = ["агент", "агенти", "агентів"];
export const DELETED_PROMPT_NOTE_ONE_TAIL = "на ньому лишиться на голій моделі.";
export const DELETED_PROMPT_NOTE_MANY_TAIL = "на ньому лишаться на голій моделі.";
export const DELETED_PROMPT_NOTE_NOBODY = "Його нікому не призначено — з ним не піде нічого.";

/** Undo-line label after a prompt deletion. */
export const DELETED_PROMPT_LABEL = "ПРОМПТ ВИДАЛЕНО";

/** The agents the prompt came off, in the line's second half. */
export const DELETED_PROMPT_LEFT_SUFFIX = "БЕЗ ПРОМПТА";
