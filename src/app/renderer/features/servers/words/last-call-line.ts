import { SERVER_FACTS_SEPARATOR, SERVER_SAID_MARK } from "../constants";
import type { McpCallFailure } from "../../../interfaces";

/**
 * The one line a row shows of a failed call: the function's name and the first line of what the server said; the whole
 * is in the call's card.
 */
export function lastCallLine(failure: McpCallFailure): string {
  return [failure.functionName, firstSaying(failure.said)].filter((part) => part !== "").join(SERVER_FACTS_SEPARATOR);
}

/**
 * The first line that says something: a markdown heading is the server's label for the block, so it is stepped over.
 * Nothing is rewritten.
 */
function firstSaying(said: string): string {
  const lines = said
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return lines.find((line) => !SERVER_SAID_MARK.test(line)) ?? lines[0] ?? "";
}
