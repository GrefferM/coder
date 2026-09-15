import { SERVER_FACTS_SEPARATOR, SERVER_SAID_MARK } from "../constants";
import type { McpCallFailure } from "../../../interfaces";

/**
 * The one line the row shows of a call that failed — the function's name and the first line of what the
 * server actually said. The whole of it lives in the call's own card: «двох різних текстів не буває — рядок є
 * початком того самого речення, а не нашим переказом».
 */
export function lastCallLine(failure: McpCallFailure): string {
  return [failure.functionName, firstSaying(failure.said)].filter((part) => part !== "").join(SERVER_FACTS_SEPARATOR);
}

/**
 * The first line that says something. A markdown heading is the server's own label for the block under it, not its
 * sentence — a row reading «### Error» has told the person nothing they did not already see in the stripe — so such
 * a line is stepped over and the one under it is shown. Nothing is rewritten: what stands there is the server's own
 * line, whole, whichever one it is.
 */
function firstSaying(said: string): string {
  const lines = said
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return lines.find((line) => !SERVER_SAID_MARK.test(line)) ?? lines[0] ?? "";
}
