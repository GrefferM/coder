import {
  SERVER_ANSWERED_PREFIX,
  SERVER_COUNT_ARROW,
  SERVER_FACTS_SEPARATOR,
  SERVER_UPDATED_PREFIX,
} from "../constants";
import type { McpLook } from "../../../interfaces";

/**
 * The closing line of a server's page — «Відповів 2 хв тому · оновлено вчора · 34 → 33».
 *
 * Three parts, each standing only when it has something to say. A server that never answered has **no line at
 * all**: it is a fact about an answer. One this machine is meeting for the first time has no «оновлено» — a change needs two looks to be
 * one — and no arrow until something actually changes.
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
