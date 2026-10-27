/** The two functions an agent that chooses its route is given, named as the model calls them. */
export const ROUTE_PASS_NAME = "pass_to";
export const ROUTE_FINISH_NAME = "finish_here";

/** The one parameter of `pass_to`: whom the answer goes to, by the word the options give. */
export const ROUTE_TO_NAME = "to";
export const ROUTE_TO_DESCRIPTION = "Кому передати свою відповідь — одне зі слів списку.";

/** What the model reads of `pass_to`; the options follow, one to a line. */
export const ROUTE_PASS_DESCRIPTION =
  "Обери, кому піде твоя відповідь. Виклич для кожного, кому вона потрібна: кого не обрав, той її не отримає. Якщо не викликати нічого, відповідь піде всім. Можна передати:";
/** What the model reads of `finish_here`. */
export const ROUTE_FINISH_DESCRIPTION =
  "Завершити на цьому: твоя відповідь остаточна і нікому далі не передається. Виклич, коли продовжувати не потрібно.";

/** One option in the description of `pass_to`; the purpose is told where the agent has one. */
export const ROUTE_OPTION_LINE = "- {label}";
export const ROUTE_OPTION_PURPOSE = " — {purpose}";
export const ROUTE_LABEL_SLOT = "{label}";
export const ROUTE_PURPOSE_SLOT = "{purpose}";

/** A second agent of the same name is told apart by its number. */
export const ROUTE_LABEL_NUMBERED = "{name} ({number})";
export const ROUTE_NAME_SLOT = "{name}";
export const ROUTE_NUMBER_SLOT = "{number}";

/** What the model is handed back for a call of either, and for a `pass_to` it must not make. */
export const ROUTE_PASSED_NOTE = "Передам: {label}.";
export const ROUTE_FINISHED_NOTE = "Далі не передаю: відповідь остаточна.";
