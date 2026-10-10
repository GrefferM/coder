/**
 * How much of an outside failure is shown: text is cut at the first markup tag, and a server's or a record's is cut
 * again if still long; a provider's fall stands whole.
 */
export const FAILURE_MARKUP = /<\s*[a-zA-Z!/]/;
export const FAILURE_MAX_CHARS = 200;
