import {
  SERVER_ANSWERED_PREFIX,
  SERVER_COUNT_ARROW,
  SERVER_FACTS_SEPARATOR,
  SERVER_UPDATED_PREFIX,
} from "../constants";
import type { McpLook } from "../../../interfaces";

/**
 * The closing line of a server's page: «Відповів 2 хв тому · оновлено вчора · 34 → 33». Each part stands only when it
 * has something to say: no line for a server that never answered; no «оновлено» or arrow on a first meeting.
 */
export function freshnessLine(look: McpLook | null, answered: string | null, updated: string | null): string | null {
  if (look === null || answered === null) {
    return null;
  }

  const said = [
    `${SERVER_ANSWERED_PREFIX}${answered}`,
    updated === null ? null : `${SERVER_UPDATED_PREFIX}${updated}`,
    look.wasCount === null ? null : `${look.wasCount}${SERVER_COUNT_ARROW}${look.functions.length}`,
  ];

  return said.filter((part) => part !== null).join(SERVER_FACTS_SEPARATOR);
}
