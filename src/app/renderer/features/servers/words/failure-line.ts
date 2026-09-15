import { SERVER_FAILURE_CUT, SERVER_FAILURE_MARKUP, SERVER_FAILURE_MAX_CHARS } from "../constants";

/**
 * What a fallen server said, as much of it as is worth showing: a row that says a server fell and not why is a
 * dead end. Its own words, though, and not its own web page — an address that answers with html hands the whole
 * page over, and a screenful of markup buries the one line that said what went wrong.
 */
export function failureLine(failure: string): string {
  const saidPlainly = plainly(failure.split(SERVER_FAILURE_MARKUP)[0] ?? "");
  // Markup from the very first character leaves nothing said: better the whole thing cut short than an empty row.
  const said = saidPlainly === "" ? plainly(failure) : saidPlainly;

  return said.length > SERVER_FAILURE_MAX_CHARS
    ? `${said.slice(0, SERVER_FAILURE_MAX_CHARS).trimEnd()}${SERVER_FAILURE_CUT}`
    : said;
}

/** One line: a failure printed over five lines is five lines of the row, and says no more than one. */
function plainly(said: string): string {
  return said.replace(/\s+/g, " ").trim();
}
