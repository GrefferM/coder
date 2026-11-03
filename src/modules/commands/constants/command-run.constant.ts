/** Handed back when a command succeeded having printed nothing. */
export const COMMAND_EMPTY_OUTPUT_NOTE = "[команда нічого не вивела]";
/** Handed back when the line itself would not run. */
export const COMMAND_FAILED_PREFIX = "[команда не виконалась]";
/** Handed back when a command ended on a non-zero code having printed nothing. */
export const COMMAND_NOTHING_PRINTED_NOTE = "[команда відпрацювала й нічого не вивела · код {code}]";
export const COMMAND_CODE_SLOT = "{code}";
/** Exit codes for nothing to run: 127 command not found, 126 could not run. */
export const COMMAND_UNRUNNABLE_CODES = [126, 127];

/** Braces and what stands between them; a slot only if the command declares a parameter so named. */
export const COMMAND_SLOT_PATTERN = /\{[^{}]*\}/g;
