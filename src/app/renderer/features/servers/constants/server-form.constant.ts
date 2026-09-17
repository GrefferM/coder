import type { ServerFormValues } from "../interfaces";

/**
 * The form as it opens on nothing. A new server is local until told otherwise — that is what
 * most of them are — and a remote one is signed in to by a token, which is the one way in there is.
 */
export const EMPTY_SERVER_FORM_VALUES: ServerFormValues = {
  name: "",
  isLocal: true,
  run: "",
  address: "",
  // A new remote server asks for nothing until somebody says otherwise: most public ones do not, and a token
  // demanded of a server that never wanted one is a row saying «ПОТРІБЕН ТОКЕН» about something wide open.
  signIn: "none",
  env: [],
};

/** The leave question names the fields by these words, and so does the blocker under «Підключити». */
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
 * The two words of the switch and the two of the way in. They live here rather than beside the panel because the
 * leave question is written by logic, and logic may not read the screen's own constants.
 */
export const SERVER_FORM_LOCAL_LABEL = "ЛОКАЛЬНИЙ";
export const SERVER_FORM_REMOTE_LABEL = "ВІДДАЛЕНИЙ";
export const SERVER_FORM_TOKEN_LABEL = "ТОКЕН";
/**
 * The third way in: a server that asks for nothing. A public one exists, and a form that cannot declare it forces
 * a token onto a server that never wanted one — then the catalogue says «ПОТРІБЕН ТОКЕН» about one simply open.
 */
export const SERVER_FORM_NO_SIGN_IN_LABEL = "БЕЗ ВХОДУ";
