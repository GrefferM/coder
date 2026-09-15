/** How the question about leaving names each field of a command's form. */
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

/** How a row counts what a command takes — «1 ПАРАМЕТР», and none in words. */
export const COMMAND_PARAMETER_FORMS = ["ПАРАМЕТР", "ПАРАМЕТРИ", "ПАРАМЕТРІВ"];
export const NO_COMMAND_PARAMETERS_LABEL = "БЕЗ ПАРАМЕТРІВ";

/** The marks a person quotes a slot with; the app puts none of its own and reads both alike. */
export const SLOT_QUOTE_MARKS = ["'", '"'];
