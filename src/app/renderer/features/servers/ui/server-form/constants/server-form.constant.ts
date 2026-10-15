import { BORDER_AT_REST_COLOR } from "../../../../../constants";
import { FIELD_BACKGROUND_COLOR } from "../../../../../components/field/constants";

/** The one form for both kinds of server. */
export const SERVER_FORM_NAME_LABEL = "ІМ'Я";
export const SERVER_FORM_NAME_PLACEHOLDER = "brave_search";
/** A server's name follows its own rule; the dash is allowed. */
export const SERVER_FORM_NAME_NOTE =
  "Латиниця, цифри, «_» і «-». Цим іменем сервер стоїть у файлі проєкту й у переліку функцій.";
export const SERVER_FORM_KIND_LABEL = "ДЕ ЖИВЕ";
export const SERVER_FORM_RUN_LABEL = "РЯДОК ЗАПУСКУ";
export const SERVER_FORM_RUN_PLACEHOLDER = "npx -y @modelcontextprotocol/server-brave-search";
/** The app starts the line and does not sandbox it. */
export const SERVER_FORM_RUN_NOTE = "Запуститься в теці проєкту, як у вашому терміналі; пісочниці немає";
export const SERVER_FORM_ADDRESS_LABEL = "АДРЕСА";
export const SERVER_FORM_ADDRESS_PLACEHOLDER = "https://mcp.linear.app/sse";
export const SERVER_FORM_SIGN_IN_LABEL = "ВХІД";
export const SERVER_FORM_CANCEL_LABEL = "Скасувати";
export const SERVER_FORM_DECLARE_LABEL = "Підключити";
export const SERVER_FORM_SAVE_LABEL = "Зберегти";
export const SERVER_FORM_CHOICE_GAP_PX = 6;
export const SERVER_FORM_CHOICE_PADDING = "7px 12px";
export const SERVER_FORM_CHOICE_RADIUS_PX = 7;
export const SERVER_FORM_CHOICE_FONT_SIZE_PX = 11;
export const SERVER_FORM_CHOICE_BORDER_COLOR = "#252a3a";
export const SERVER_FORM_CHOICE_COLOR = "#8b93ab";
export const SERVER_FORM_CHOICE_CHOSEN_COLOR = "#dde1ee";
export const SERVER_FORM_CHOICE_CHOSEN_BACKGROUND = "#1b2030";

/** A variable's name goes in the project file; its value, like any token, stays in this machine's keychain. */
export const SERVER_FORM_ENV_LABEL = "ЗМІННІ СЕРЕДОВИЩА";
export const SERVER_FORM_ENV_NOTE =
  "Ім'я їде у файлі проєкту, значення лишається на цій машині. Процес біжить із відфільтрованим середовищем плюс цим.";
/** A variable is a block of two fields, each labelled with where it goes. */
export const SERVER_FORM_ENV_NAME_LABEL = "назва";
export const SERVER_FORM_ENV_VALUE_LABEL = "значення";
export const SERVER_FORM_ENV_NAME_PLACEHOLDER = "BRAVE_API_KEY";
export const SERVER_FORM_ENV_ADD_LABEL = "ЗМІННА";
export const SERVER_FORM_ENV_REMOVE_LABEL = "ПРИБРАТИ";
/**
 * What an empty value says in the field; only the short half fits a narrow tab, and the catalogue row says the launch
 * half.
 */
export const SERVER_FORM_MISSING_NOTE = "нема значення";
export const SERVER_FORM_TOKEN_PLACEHOLDER = "sk-…";
/**
 * What a value kept on this machine says under its field. The cross removes it, not an empty field. A token says
 * «ключ», a variable «значення»; otherwise the same sentence.
 */
export const SERVER_FORM_SECRET_NOTE = "Ключ лежить у сховищі цієї машини. Хрестик прибирає його звідси.";
export const SERVER_FORM_ENV_VALUE_NOTE = "Значення лежить у сховищі цієї машини. Хрестик прибирає його звідси.";
/** A variable is a box in the field's own shade with the fields sunk inside, so the block's edge is visible. */
export const SERVER_FORM_ENV_GAP_PX = 10;
export const SERVER_FORM_ENV_BLOCK_GAP_PX = 8;
export const SERVER_FORM_ENV_BOX_BACKGROUND_COLOR = FIELD_BACKGROUND_COLOR;
export const SERVER_FORM_ENV_BOX_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const SERVER_FORM_ENV_BOX_RADIUS_PX = 10;
export const SERVER_FORM_ENV_BOX_PADDING_PX = 10;

/** The head of one block: its name and the action that belongs to it. */
export const SERVER_FORM_ENV_BLOCK_LABEL = "змінна";

/**
 * What each half of a variable says beside its label: the name goes to the project file, the value never leaves this
 * machine.
 */
export const SERVER_FORM_ENV_NAME_GOES = "у файл проєкту";
export const SERVER_FORM_ENV_VALUE_GOES = "лишається тут";

/** «+ ЗМІННА»: a dashed row the width of the list that adds one and marks the list's edge. */
export const SERVER_FORM_ENV_ADD_BORDER_COLOR = "#2c3550";
export const SERVER_FORM_ENV_ADD_RADIUS_PX = 9;
export const SERVER_FORM_ENV_ADD_PADDING_PX = 9;
export const SERVER_FORM_ENV_ADD_GAP_PX = 7;
export const SERVER_FORM_ENV_ADD_GLYPH_PX = 12;

/** The count in the slot's head, and the rule running from it to the edge. */
export const SERVER_FORM_ENV_COUNT_SEPARATOR = " · ";
