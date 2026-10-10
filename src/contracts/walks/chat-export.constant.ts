/**
 * The words the export writes around the turns; the transcript is read away from the app, so it names in full who
 * spoke, when, and what went to and came back from a tool.
 */
export const CHAT_EXPORT_HEADING = "РОЗМОВА";
export const CHAT_EXPORT_RULE = "────────────────────────────────────────";
/** The person's own turns; an agent's are named by the agent. */
export const CHAT_EXPORT_PERSON = "ВИ";
/** Mark on a turn that carried work in from a neighbour, and on a question that never went. */
export const CHAT_EXPORT_SUPPLIER_SUFFIX = " (робота)";
export const CHAT_EXPORT_HANDOFF_PREFIX = "роботу передано: ";
export const CHAT_EXPORT_HANDOFF_ARROW = " → ";
export const CHAT_EXPORT_NOT_SENT_PREFIX = "не надіслано до: ";
/** A line the work did not go down, with the neighbour's reason after it. */
export const CHAT_EXPORT_NOT_HANDED_PREFIX = "роботу не передано: ";
export const CHAT_EXPORT_REASON_OPEN = " (";
export const CHAT_EXPORT_REASON_CLOSE = ")";
/** Marks on a turn that fell and on one that never began. */
export const CHAT_EXPORT_FAILED_SUFFIX = " (упав)";
export const CHAT_EXPORT_NOT_STARTED_SUFFIX = " (хід не почався)";
/** The app's own word about a turn or a broken step. */
export const CHAT_EXPORT_NOTE_PREFIX = "  ! ";
/** Files named under a question, by leaf name; a folder with a trailing slash. */
export const CHAT_EXPORT_ATTACHED_LABEL = "Прикріплено: ";
export const CHAT_EXPORT_ATTACHED_SEPARATOR = ", ";
export const CHAT_EXPORT_FOLDER_SUFFIX = "/";
/** One tool call: its name, its command line if any, its input and its result. */
export const CHAT_EXPORT_CALL_PREFIX = "  → ";
export const CHAT_EXPORT_CALL_LINE_LABEL = "    команда: ";
export const CHAT_EXPORT_CALL_ARGS_LABEL = "    аргументи:";
export const CHAT_EXPORT_CALL_ARG_PREFIX = "      ";
export const CHAT_EXPORT_CALL_ARG_SEPARATOR = ": ";
export const CHAT_EXPORT_CALL_RESULT_LABEL = "    результат:";
export const CHAT_EXPORT_CALL_BODY_PREFIX = "      ";
export const CHAT_EXPORT_CALL_REFUSED_LABEL = "    відмовлено";
export const CHAT_EXPORT_CALL_FAILED_LABEL = "    помилка";
/** The save chooser's default name, before the date and «.txt». */
export const CHAT_EXPORT_FILE_PREFIX = "розмова";
export const CHAT_EXPORT_FILE_EXTENSION = ".txt";
