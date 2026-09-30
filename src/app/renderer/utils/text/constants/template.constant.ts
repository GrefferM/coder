/** A brace slot and what is between the braces; whether it names a declared parameter is decided elsewhere. */
export const TEMPLATE_SLOT_PATTERN = /\{[^{}]*\}/g;

/** The two braces; a slot opens on one and ends on the other or a space. */
export const SLOT_OPEN = "{";
export const SLOT_CLOSE = "}";

/** A parameter name: letters, digits and «_», not starting with a digit. */
export const TEMPLATE_NAME_PATTERN = /^[\p{L}_][\p{L}\p{N}_]*$/u;

/** Three or more newlines collapse to one blank line. */
export const ANSWER_BLANK_LINES_PATTERN = /\n{3,}/g;
export const ANSWER_ONE_BLANK_LINE = "\n\n";
