/** How many leading bytes are sniffed for a zero, the mark of non-text. */
export const ATTACHMENT_BINARY_SNIFF_BYTES = 8000;

/** The header that opens one attachment's block, and what closes it. */
export const ATTACHMENT_HEADER_PREFIX = "[Вкладення · ";
export const ATTACHMENT_HEADER_SUFFIX = "]";

/** The rule drawn around each file's path, above its content. */
export const ATTACHMENT_FILE_RULE = "───";

/** Written after a binary file's path; its body is base64. */
export const ATTACHMENT_BINARY_TAG = " (base64)";

/** The label above a folder's list of paths, and the indent of each path. */
export const ATTACHMENT_TREE_LABEL = "Дерево:";
export const ATTACHMENT_TREE_INDENT = "  ";

/** How many files are weighed at once while a picked folder is counted. */
export const ATTACHMENT_STAT_BATCH = 256;

/** The most bytes one character takes in UTF-8; a file is read only as far as can still fit under the ceiling. */
export const ATTACHMENT_MOST_BYTES_PER_CHARACTER = 4;

/** The halves of a surrogate pair, counted as one character. */
export const ATTACHMENT_HIGH_SURROGATE_FIRST = 0xd800;
export const ATTACHMENT_HIGH_SURROGATE_LAST = 0xdbff;
export const ATTACHMENT_LOW_SURROGATE_FIRST = 0xdc00;
export const ATTACHMENT_LOW_SURROGATE_LAST = 0xdfff;

/** Written after a path the system would not let us read; it stands in the tree, its content is not included. */
export const ATTACHMENT_DENIED_TAG = " (немає доступу)";
