/**
 * The words the export writes around the turns. A transcript is read on its own, away from the app, so it names
 * in full what the stream leaves to colour and shape — who spoke, when, what went to a tool and what came back.
 */
export const CHAT_EXPORT_HEADING = "РОЗМОВА";
export const CHAT_EXPORT_RULE = "────────────────────────────────────────";
/** The person's own turns; an agent's are named by the agent. */
export const CHAT_EXPORT_PERSON = "ВИ";
/** A turn that carried work in from a neighbour, and the mark on a question that never went. */
export const CHAT_EXPORT_SUPPLIER_SUFFIX = " (робота)";
export const CHAT_EXPORT_HANDOFF_PREFIX = "роботу передано: ";
export const CHAT_EXPORT_HANDOFF_ARROW = " → ";
export const CHAT_EXPORT_NOT_SENT_PREFIX = "не надіслано до: ";
/** The files named under a person's question, by leaf name, a folder with a trailing slash. */
export const CHAT_EXPORT_ATTACHED_LABEL = "Прикріплено: ";
export const CHAT_EXPORT_ATTACHED_SEPARATOR = ", ";
export const CHAT_EXPORT_FOLDER_SUFFIX = "/";
/** One tool call: its name, the command line where it ran one, what went in, and what came back. */
export const CHAT_EXPORT_CALL_PREFIX = "  → ";
export const CHAT_EXPORT_CALL_LINE_LABEL = "    команда: ";
export const CHAT_EXPORT_CALL_ARGS_LABEL = "    аргументи:";
export const CHAT_EXPORT_CALL_ARG_PREFIX = "      ";
export const CHAT_EXPORT_CALL_ARG_SEPARATOR = ": ";
export const CHAT_EXPORT_CALL_RESULT_LABEL = "    результат:";
export const CHAT_EXPORT_CALL_BODY_PREFIX = "      ";
export const CHAT_EXPORT_CALL_REFUSED_LABEL = "    відмовлено";
export const CHAT_EXPORT_CALL_FAILED_LABEL = "    помилка";
/** The name the save chooser opens on, before its date and «.txt». */
export const CHAT_EXPORT_FILE_PREFIX = "розмова";
export const CHAT_EXPORT_FILE_EXTENSION = ".txt";
