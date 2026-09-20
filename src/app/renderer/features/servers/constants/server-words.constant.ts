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
/**
 * Three different sentences for three different answers, because three different hands mend them —
 * type a token in, type another one, or go and look at the address. One «НЕ ПРАЦЮЄ» for all three would name the
 * trouble nobody can act on.
 */
export const SERVER_TOKEN_MISSING_LABEL = "ПОТРІБЕН ТОКЕН";
export const SERVER_TOKEN_MISSING_ACTION = "УВІЙТИ";
export const SERVER_UNREACHABLE_LABEL = "СЕРВЕР НЕ ВІДПОВІДАЄ";
/** A declared variable this machine holds no value for; the name travels with it, because the row names it. */
export const SERVER_VALUE_MISSING_LABEL = "НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: ";
export const SERVER_VALUE_MISSING_ACTION = "ВПИСАТИ";
/**
 * «Змінити» belongs in the foot of the opened card beside «Видалити», not in the head: a head holds at most one
 * action, the one its state asks for. Until the card opens on every row this stands in the head, which is what
 * makes the head wrap and puts two actions of different weight side by side.
 */
export const SERVER_EDIT_LABEL = "ЗМІНИТИ";
/** Beside «Змінити» and lighter than it — a bare word, red only inside the question's box. */
export const SERVER_DELETE_LABEL = "ВИДАЛИТИ";
/**
 * A server that answers and works for nobody. It is not «ПРОЦЕС УПАВ» — the connection is whole and the
 * catalogue is true — so it says what it is instead of what it is not, and the count of functions still stands.
 */
export const SERVER_ALIVE_LABEL = "ЖИВИЙ";
export const SERVER_NONE_ANSWERED_LABEL = "ЖОДНА ФУНКЦІЯ НЕ ВІДПОВІЛА";
/** «межа названа числом» — three calls failed one after another and none has worked since connecting. */
export const SERVER_NONE_ANSWERED_AFTER = 3;
/** The stripe under the name, with the moment the call failed after it. */
export const SERVER_LAST_CALL_FELL_LABEL = "ОСТАННІЙ ВИКЛИК УПАВ";
/**
 * In the state where nothing has answered, the row already says that in its facts, so the block under
 * it drops the word «УПАВ» and stands quiet: the news there is not that this one failed, but that none worked.
 */
export const SERVER_LAST_CALL_LABEL = "ОСТАННІЙ ВИКЛИК";
/**
 * The way from the catalogue to the call itself — «передача, а не друга домівка». The whole of the
 * server's sentence lives in the call's card, and this is what leads there.
 */
export const SERVER_SHOW_CALL_LABEL = "ПОКАЗАТИ ВИКЛИК";
/**
 * What stands in place of that way when it leads nowhere: the record cannot say where the call is, because the
 * run was forgotten and took its calls with it, or the call was written before calls kept an id of their own.
 * Said in place of the press rather than over it — the offer that cannot be kept stops being an offer.
 */
export const SERVER_CALL_LOST_LABEL = "ЗАПИС ДО ЦЬОГО ВИКЛИКУ НЕ ВЕДЕ";
/**
 * The ceiling of the handshake, said out loud while the waiting goes on — «дві хвилини, і вона на
 * екрані». The minutes are not written here: they are read off `MCP_CONNECT_TIMEOUT_MS`, so the sentence cannot
 * go on promising two minutes after somebody has given the handshake three.
 */
export const SERVER_STARTING_CEILING_HEAD = "СПИНИМО ЧЕРЕЗ ";
export const SERVER_STARTING_CEILING_TAIL = " ХВ";
/**
 * The second line, and it comes only on the twentieth second — «доти чекання звичайне». No bar with
 * it: the fraction is nobody's to know, and a bar would promise one.
 */
export const SERVER_STARTING_SLOW_LABEL = "ТЯГНЕ ПАКЕТ · ПЕРШИЙ ЗАПУСК БУВАЄ ДОВГИЙ";
export const SERVER_STARTING_SLOW_AFTER_SECONDS = 20;
/**
 * «СКАСУВАТИ» stands beside the ceiling and gives the place back at once, asking nothing — a wait with
 * no way out of it is the whole reason a person reaches for the project file.
 */
export const SERVER_STOP_ASKING_LABEL = "СКАСУВАТИ";
/**
 * A server nobody has raised has **no number**: there is nowhere to take one from, and «33 ФУНКЦІЇ» without a
 * rise would be a promise. Its grants stay and are counted — a person gave those, and the server was never asked.
 */
export const SERVER_UNKNOWN_LABEL = "ФУНКЦІЇ НЕВІДОМІ";
/**
 * The closing line of a server's page — «Відповів 2 хв тому · оновлено вчора · 34 → 33». Only
 * the first part stands yet; the other two live on the memory of the last look, which is this machine's and is
 * not built. A server that never answered has **no line at all**: it is a fact about an answer, and there was none.
 */
export const SERVER_ANSWERED_PREFIX = "Відповів ";
/** The middle part — when the list of functions last differed from what this machine saw. */
export const SERVER_UPDATED_PREFIX = "оновлено ";
/**
 * «34 → 33». It is **news** and not a state: it goes out when the page is opened, and not when somebody mends
 * the grant the vanished function left behind — that trouble is the agent's, and is told in the agent's tab.
 */
export const SERVER_COUNT_ARROW = " → ";
/**
 * What a **remote** server that stands answering is offered — its list is asked for again, and nothing
 * is killed. The kind decides the word because it decides the thing: a local server is our process, and it is put
 * down and raised; a remote one is a connection, and one only asks it again.
 *
 * «ЗУПИНИТИ» is nowhere: a server stopped by hand is a declaration with nothing behind it. «СКАСУВАТИ» is not
 * its pair — it lets go of the **waiting**. A server is stopped by closing the project, and taken away by
 * being deleted.
 */
export const SERVER_ASK_AGAIN_LABEL = "ПЕРЕПИТАТИ";
/** A server that answers and works for nobody is restarted, not started — it never fell. */
export const SERVER_RESTART_ALIVE_LABEL = "ПЕРЕЗАПУСТИТИ";
/**
 * What the state says in words under the facts. The count is the one the calls actually came to, and
 * the verb goes with the noun's form, or a row would say «21 виклик поспіль упали» to somebody who can read.
 */
export const SERVER_CALL_FELL_FORMS: [string, string, string] = [
  "виклик поспіль упав",
  "виклики поспіль упали",
  "викликів поспіль упало",
];
export const SERVER_NONE_ANSWERED_NOTE_TAIL =
  ", вдалого не було жодного з підключення. Каталог сервер віддав, роботу — ні.";
/**
 * A line of a server's answer that is a mark and not a saying: a markdown heading, a fence, a rule. Servers answer
 * in markdown often enough — playwright-mcp opens its failure with `### Error` — and a row showing that shows
 * nothing at all. The heading is skipped and the sentence under it stands: still the server's own words.
 */
export const SERVER_SAID_MARK = /^(#{1,6}\s|`{3}|-{3,}|\*{3,}|={3,})/;
