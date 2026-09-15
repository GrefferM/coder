/** Braces and what stands between them; whether that names a declared parameter is decided elsewhere. */
export const TEMPLATE_SLOT_PATTERN = /\{[^{}]*\}/g;

/** The two braces themselves — a slot opens on one and is ended by the other, or by a space. */
export const SLOT_OPEN = "{";
export const SLOT_CLOSE = "}";

/** What a parameter may be named: letters, digits and «_», never starting with a digit. */
export const TEMPLATE_NAME_PATTERN = /^[\p{L}_][\p{L}\p{N}_]*$/u;

/** Three or more newlines collapse to one blank line. */
export const ANSWER_BLANK_LINES_PATTERN = /\n{3,}/g;
export const ANSWER_ONE_BLANK_LINE = "\n\n";
