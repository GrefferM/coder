/** What a row says about a server. */
export const SERVER_LOCAL_LABEL = "ЛОКАЛЬНИЙ";
export const SERVER_REMOTE_LABEL = "ВІДДАЛЕНИЙ";
export const SERVER_FELL_LABEL = "ПРОЦЕС УПАВ";
/** While a server is being started and has not answered yet. */
export const SERVER_STARTING_LABEL = "ЗАПУСКАЄТЬСЯ";
export const SERVER_FUNCTION_FORMS: [string, string, string] = ["ФУНКЦІЯ", "ФУНКЦІЇ", "ФУНКЦІЙ"];
export const SERVER_AGENT_FORMS: [string, string, string] = ["АГЕНТ", "АГЕНТИ", "АГЕНТІВ"];
export const SERVER_FACTS_SEPARATOR = " · ";
export const SERVER_RESTART_LABEL = "ЗАПУСТИТИ";
/** One sentence per fix: type a token, or check the address. */
export const SERVER_TOKEN_MISSING_LABEL = "ПОТРІБЕН ТОКЕН";
export const SERVER_TOKEN_MISSING_ACTION = "УВІЙТИ";
export const SERVER_UNREACHABLE_LABEL = "СЕРВЕР НЕ ВІДПОВІДАЄ";
/** A declared variable with no value on this machine; the name follows it. */
export const SERVER_VALUE_MISSING_LABEL = "НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: ";
export const SERVER_VALUE_MISSING_ACTION = "ВПИСАТИ";
export const SERVER_EDIT_LABEL = "ЗМІНИТИ";
/** Beside «Змінити», lighter: a bare word, red only inside the question's box. */
export const SERVER_DELETE_LABEL = "ВИДАЛИТИ";
/** A server that answers and works for nobody; the connection is whole and the function count stands. */
export const SERVER_ALIVE_LABEL = "ЖИВИЙ";
export const SERVER_NONE_ANSWERED_LABEL = "ЖОДНА ФУНКЦІЯ НЕ ВІДПОВІЛА";
/** Three calls failed one after another and none has worked since connecting. */
export const SERVER_NONE_ANSWERED_AFTER = 3;
/** The stripe under the name, followed by the moment the call failed. */
export const SERVER_LAST_CALL_FELL_LABEL = "ОСТАННІЙ ВИКЛИК УПАВ";
/** Where nothing has answered the row already says so, so this block drops «УПАВ» and stands quiet. */
export const SERVER_LAST_CALL_LABEL = "ОСТАННІЙ ВИКЛИК";
/** Leads from the catalogue to the call's card, where the server's whole sentence lives. */
export const SERVER_SHOW_CALL_LABEL = "ПОКАЗАТИ ВИКЛИК";
/**
 * Stands in place of the way to the call when the record cannot say where it is: the run was forgotten, or the call has
 * no id of its own.
 */
export const SERVER_CALL_LOST_LABEL = "ЗАПИС ДО ЦЬОГО ВИКЛИКУ НЕ ВЕДЕ";
/** The record could not be asked where the call stands; what it said follows. */
export const SERVER_CALL_UNREAD_LABEL = "ЗАПИС НЕ ПРОЧИТАВСЯ";
/** The handshake ceiling shown while waiting; the minutes are read off `MCP_CONNECT_TIMEOUT_MS`. */
export const SERVER_STARTING_CEILING_HEAD = "СПИНИМО ЧЕРЕЗ ";
export const SERVER_STARTING_CEILING_TAIL = " ХВ";
/** Appears only at the twentieth second; no bar, as the fraction is unknown. */
export const SERVER_STARTING_SLOW_LABEL = "ТЯГНЕ ПАКЕТ · ПЕРШИЙ ЗАПУСК БУВАЄ ДОВГИЙ";
export const SERVER_STARTING_SLOW_AFTER_SECONDS = 20;
/** «СКАСУВАТИ»: stands beside the ceiling and ends the wait at once, asking nothing. */
export const SERVER_STOP_ASKING_LABEL = "СКАСУВАТИ";
/** A server nobody has raised has no function count; its grants stay and are counted. */
export const SERVER_UNKNOWN_LABEL = "ФУНКЦІЇ НЕВІДОМІ";
/** Opens the closing line of a server's page: «Відповів 2 хв тому · оновлено вчора · 34 → 33». */
export const SERVER_ANSWERED_PREFIX = "Відповів ";
/** When the function list last differed from what this machine saw. */
export const SERVER_UPDATED_PREFIX = "оновлено ";
/** «34 → 33»: news, not a state; it goes out when the page is opened. */
export const SERVER_COUNT_ARROW = " → ";
/**
 * Offered for a remote server that is answering: its list is asked for again and nothing is killed. «ЗУПИНИТИ» does not
 * exist, and «СКАСУВАТИ» is not its pair since it ends the waiting.
 */
export const SERVER_ASK_AGAIN_LABEL = "ПЕРЕПИТАТИ";
/** A server that answers and works for nobody is restarted, not started. */
export const SERVER_RESTART_ALIVE_LABEL = "ПЕРЕЗАПУСТИТИ";
/** The state's words under the facts; the verb agrees with the count's noun form. */
export const SERVER_CALL_FELL_FORMS: [string, string, string] = [
  "виклик поспіль упав",
  "виклики поспіль упали",
  "викликів поспіль упало",
];
export const SERVER_NONE_ANSWERED_NOTE_TAIL =
  ", вдалого не було жодного з підключення. Каталог сервер віддав, роботу — ні.";
/**
 * A line of a server's answer that is markdown structure, not speech (heading, fence, rule); it is skipped so the
 * sentence under it shows.
 */
export const SERVER_SAID_MARK = /^(#{1,6}\s|`{3}|-{3,}|\*{3,}|={3,})/;
