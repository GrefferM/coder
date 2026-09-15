import { BORDER_AT_REST_COLOR } from "../../../../../constants";
import { FIELD_BACKGROUND_COLOR } from "../../../../../components/field/constants";

/**
 * The one form, both kinds of server in it. The switch in its head says which kind is meant —
 * a question standing before the form would be a decision taken away from the form it belongs to — and it is the
 * first slot of the keyboard's road.
 */
export const SERVER_FORM_NAME_LABEL = "ІМ'Я";
export const SERVER_FORM_NAME_PLACEHOLDER = "brave_search";
/** A server's name is not a function name, and its rule says so — the dash belongs here. */
export const SERVER_FORM_NAME_NOTE =
  "Латиниця, цифри, «_» і «-». Цим іменем сервер стоїть у файлі проєкту й у переліку функцій.";
export const SERVER_FORM_KIND_LABEL = "ДЕ ЖИВЕ";
export const SERVER_FORM_RUN_LABEL = "РЯДОК ЗАПУСКУ";
export const SERVER_FORM_RUN_PLACEHOLDER = "npx -y @modelcontextprotocol/server-brave-search";
/** The border of responsibility: the app starts a line, it does not fence it in. */
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

/**
 * The half of the form that never reaches the project file. The name of a variable rides in
 * the file, the value stays in this machine's keychain, and a token the same way.
 */
export const SERVER_FORM_ENV_LABEL = "ЗМІННІ СЕРЕДОВИЩА";
export const SERVER_FORM_ENV_NOTE =
  "Ім'я їде у файлі проєкту, значення лишається на цій машині. Процес біжить із відфільтрованим середовищем плюс цим.";
/** A variable is a **block of two fields**, one under the other, and each half says where it goes. */
export const SERVER_FORM_ENV_NAME_LABEL = "назва";
export const SERVER_FORM_ENV_VALUE_LABEL = "значення";
export const SERVER_FORM_ENV_NAME_PLACEHOLDER = "BRAVE_API_KEY";
export const SERVER_FORM_ENV_ADD_LABEL = "ЗМІННА";
export const SERVER_FORM_ENV_REMOVE_LABEL = "ПРИБРАТИ";
/**
 * What an empty value says of itself in the field. The half about the launch is left to the catalogue's row,
 * which says «НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: …» where the server actually fails to start; here the warned edge
 * already says there is trouble, and a field the width of a narrow tab has room for the short half alone.
 */
export const SERVER_FORM_MISSING_NOTE = "нема значення";
export const SERVER_FORM_TOKEN_PLACEHOLDER = "sk-…";
/**
 * What a value kept on this machine says under its field. The cross takes it off, **not** an
 * empty field — «порожнє поле = прибрати» made saving a trap: open a form, touch nothing, save, and the key was
 * gone. A token says «ключ», a variable says «значення»; the sentence is otherwise word for word the same.
 */
export const SERVER_FORM_SECRET_NOTE = "Ключ лежить у сховищі цієї машини. Хрестик прибирає його звідси.";
export const SERVER_FORM_ENV_VALUE_NOTE = "Значення лежить у сховищі цієї машини. Хрестик прибирає його звідси.";
/**
 * A variable is a **box**, and the box is painted the field's own shade with the fields sunk inside it —
 * a line between blocks holds two of them and disappears at six, and the eye must see a block's edge, not hunt it.
 */
export const SERVER_FORM_ENV_GAP_PX = 10;
export const SERVER_FORM_ENV_BLOCK_GAP_PX = 8;
export const SERVER_FORM_ENV_BOX_BACKGROUND_COLOR = FIELD_BACKGROUND_COLOR;
export const SERVER_FORM_ENV_BOX_BORDER_COLOR = BORDER_AT_REST_COLOR;
export const SERVER_FORM_ENV_BOX_RADIUS_PX = 10;
export const SERVER_FORM_ENV_BOX_PADDING_PX = 10;

/** The head of one block: the word that names it, and the act that belongs to it and not to the list. */
export const SERVER_FORM_ENV_BLOCK_LABEL = "змінна";

/**
 * What each half of a variable says about itself beside its own label: this is the whole point of the block, and
 * it is said where the eye already is — the name rides in the project file, the value never leaves this machine.
 */
export const SERVER_FORM_ENV_NAME_GOES = "у файл проєкту";
export const SERVER_FORM_ENV_VALUE_GOES = "лишається тут";

/** «+ ЗМІННА» — a dashed row the width of the list: the way to add one, and the list's own visible edge. */
export const SERVER_FORM_ENV_ADD_BORDER_COLOR = "#2c3550";
export const SERVER_FORM_ENV_ADD_RADIUS_PX = 9;
export const SERVER_FORM_ENV_ADD_PADDING_PX = 9;
export const SERVER_FORM_ENV_ADD_GAP_PX = 7;
export const SERVER_FORM_ENV_ADD_GLYPH_PX = 12;

/** The count the slot's head carries, and the rule that runs from it to the edge, as every list head does. */
export const SERVER_FORM_ENV_COUNT_SEPARATOR = " · ";
