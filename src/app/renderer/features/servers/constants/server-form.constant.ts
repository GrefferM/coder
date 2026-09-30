import type { ServerFormValues } from "../interfaces";

/** The form on opening: a new server is local, and a remote one signs in by token. */
export const EMPTY_SERVER_FORM_VALUES: ServerFormValues = {
  name: "",
  isLocal: true,
  run: "",
  address: "",
  // A new remote server asks for no sign-in, as most public ones need none.
  signIn: "none",
  env: [],
};

/** Names the fields in the leave question and in the blocker under «Підключити». */
export const SERVER_NAME_DROPPED_LABEL = "ім'я";
export const SERVER_RUN_DROPPED_LABEL = "рядок запуску";
export const SERVER_ADDRESS_DROPPED_LABEL = "адреса";

/** What the leave question calls each field that was changed. */
export const SERVER_NAME_CHANGE_LABEL = "Ім'я";
export const SERVER_KIND_CHANGE_LABEL = "Де живе";
export const SERVER_RUN_CHANGE_LABEL = "Рядок запуску";
export const SERVER_ADDRESS_CHANGE_LABEL = "Адреса";
export const SERVER_SIGN_IN_CHANGE_LABEL = "Вхід";

/**
 * The switch's two words and the sign-in's two; kept here because the leave question is written by logic, which may not
 * read the screen's constants.
 */
export const SERVER_FORM_LOCAL_LABEL = "ЛОКАЛЬНИЙ";
export const SERVER_FORM_REMOTE_LABEL = "ВІДДАЛЕНИЙ";
export const SERVER_FORM_TOKEN_LABEL = "ТОКЕН";
/** The third sign-in: a server that asks for nothing, so a public one is not forced to a token. */
export const SERVER_FORM_NO_SIGN_IN_LABEL = "БЕЗ ВХОДУ";
