/**
 * How much of an outside failure is shown: text is cut at the first markup tag, and cut again if still long. One rule
 * for every failure from outside the app, servers' and providers' alike.
 */
export const FAILURE_MARKUP = /<\s*[a-zA-Z!/]/;
export const FAILURE_MAX_CHARS = 200;
