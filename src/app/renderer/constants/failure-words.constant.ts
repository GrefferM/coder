/**
 * How much of somebody else's failure is worth showing, and where it stops being words. An address that is not
 * a server at all answers with a whole web page, and the transport hands it over tag for tag: everything worth
 * reading stood before the first tag, so the words are cut there, and cut again if even they run long.
 *
 * One rule for every failure that came from outside this app — a server's in the catalogue, a provider's in the
 * chat — because they are read in the same breath and must not be cut two different ways.
 */
export const FAILURE_MARKUP = /<\s*[a-zA-Z!/]/;
export const FAILURE_MAX_CHARS = 200;
