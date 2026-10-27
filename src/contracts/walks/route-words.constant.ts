/** The parameters of `pass_to`: whom it goes to, each by the word the options give, and what they get. */
export const ROUTE_TO_NAME = "to";
export const ROUTE_TO_DESCRIPTION = "Кому передати — одне чи кілька слів зі списку.";
export const ROUTE_TEXT_NAME = "text";
export const ROUTE_TEXT_DESCRIPTION = "Що отримають названі — повний текст завдання чи результату для них.";

/** What the model reads of `pass_to`; the options follow, one to a line. */
export const ROUTE_PASS_DESCRIPTION =
  "Передати далі. У `to` назви одного чи кількох зі списку, у `text` напиши, що вони отримають. Різним — різний текст: виклич кілька разів. Якщо ти викликав цю команду, далі йде лише те, що ти передав нею, а твоя відповідь — ні. Можна передати:";
/** What the model reads of `finish_here`. */
export const ROUTE_FINISH_DESCRIPTION =
  "Завершити гілку. Виклич, коли продовжувати не потрібно: далі нічого не піде. Писати нічого не треба. Після виклику твій хід завершено.";

/** One option in the description of `pass_to`; the purpose is told where the agent has one. */
export const ROUTE_OPTION_LINE = "- {label}";
export const ROUTE_OPTION_PURPOSE = " — {purpose}";
export const ROUTE_LABEL_SLOT = "{label}";
export const ROUTE_PURPOSE_SLOT = "{purpose}";

/** A second agent of the same name is told apart by its number. */
export const ROUTE_LABEL_NUMBERED = "{name} ({number})";
export const ROUTE_NAME_SLOT = "{name}";
export const ROUTE_NUMBER_SLOT = "{number}";

/** What the model is handed back for a call of either; the labels of a `pass_to` are joined. */
export const ROUTE_PASSED_NOTE = "Передам: {label}.";
export const ROUTE_FINISHED_NOTE = "Гілку завершено.";
