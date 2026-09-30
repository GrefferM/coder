/** Names each field of a command's form in the leave question. */
export const COMMAND_NAME_CHANGE_LABEL = "ім'я";
export const COMMAND_NAME_DROPPED_LABEL = "ім'я";
export const COMMAND_DESCRIPTION_CHANGE_LABEL = "опис";
export const COMMAND_DESCRIPTION_DROPPED_LABEL = "опис";
export const COMMAND_RUN_CHANGE_LABEL = "рядок запуску";
export const COMMAND_RUN_DROPPED_LABEL = "рядок запуску";
export const COMMAND_PARAMETERS_CHANGE_LABEL = "параметри";
export const COMMAND_PARAMETERS_DROPPED_LABEL = "параметри";

export const EMPTY_COMMAND_FORM_VALUES = {
  name: "",
  description: "",
  run: "",
  parameters: [],
};

/** Counts what a command takes: «1 ПАРАМЕТР». */
export const COMMAND_PARAMETER_FORMS = ["ПАРАМЕТР", "ПАРАМЕТРИ", "ПАРАМЕТРІВ"];
export const NO_COMMAND_PARAMETERS_LABEL = "БЕЗ ПАРАМЕТРІВ";

/** The marks a slot may be quoted with; both read alike. */
export const SLOT_QUOTE_MARKS = ["'", '"'];
