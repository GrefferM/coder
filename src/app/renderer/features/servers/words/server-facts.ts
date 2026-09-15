import { ukrainianPlural } from "../../../utils/text";
import { noneAnswered, serverTrouble } from "../logic";
import {
  SERVER_AGENT_FORMS,
  SERVER_ALIVE_LABEL,
  SERVER_FACTS_SEPARATOR,
  SERVER_FELL_LABEL,
  SERVER_FUNCTION_FORMS,
  SERVER_LOCAL_LABEL,
  SERVER_NONE_ANSWERED_LABEL,
  SERVER_REMOTE_LABEL,
  SERVER_STARTING_LABEL,
  SERVER_TOKEN_MISSING_LABEL,
  SERVER_UNKNOWN_LABEL,
  SERVER_UNREACHABLE_LABEL,
  SERVER_VALUE_MISSING_LABEL,
} from "../constants";
import type { McpLook, ProjectMcpServer } from "../../../interfaces";

/**
 * The one line under a server's name — what it is, how much it hands over, and how many agents hold any
 * of it. A server that fell says so in place of its kind, because that is the fact that matters about it just then:
 * «ПРОЦЕС УПАВ · 12 ФУНКЦІЙ · 1 АГЕНТ», where the count is what it handed over while it still stood.
 */
export function serverFacts(
  server: ProjectMcpServer,
  look: McpLook | null,
  clock: string | null,
  functionCount: number,
  agentCount: number,
): string {
  /**
   * A count is given only by a server that has just answered. One nobody has a token for was
   * never asked, and one being raised right now has not answered yet — in both, last time's number is a number
   * somebody might believe. The agents stay counted through either: a grant is a person's own doing.
   */
  const hasNoCount = clock !== null || serverTrouble(look)?.kind === "tokenMissing";

  return [
    standing(server, look, clock),
    hasNoCount ? null : countOf(functionCount, SERVER_FUNCTION_FORMS),
    countOf(agentCount, SERVER_AGENT_FORMS),
  ]
    .filter((fact) => fact !== null)
    .join(SERVER_FACTS_SEPARATOR);
}

/** What the server is, or what has become of it; being asked wins over both, since neither is known yet. */
function standing(server: ProjectMcpServer, look: McpLook | null, clock: string | null): string {
  if (clock !== null) {
    // A clock counting up and no bar — how much is left is nobody's to know, and a bar would say it is.
    return `${SERVER_STARTING_LABEL}${SERVER_FACTS_SEPARATOR}${clock}`;
  }

  const trouble = serverTrouble(look);

  if (trouble !== null) {
    // A server that never started is not a fallen one, and each reason has its own sentence.
    if (trouble.kind === "tokenMissing") {
      return SERVER_TOKEN_MISSING_LABEL;
    }

    if (trouble.kind === "valueMissing") {
      return `${SERVER_VALUE_MISSING_LABEL}${trouble.name ?? ""}`;
    }

    return trouble.kind === "unreachable" ? SERVER_UNREACHABLE_LABEL : SERVER_FELL_LABEL;
  }

  /**
   * A server that has not been raised says that plainly: its kind is the least of what anybody wants to know,
   * and «ЛОКАЛЬНИЙ» alone read as a server standing quietly in good order.
   */
  if (look === null) {
    return SERVER_UNKNOWN_LABEL;
  }

  // What a server is matters less than that it works for nobody, so this stands in place of its kind.
  if (noneAnswered(look)) {
    return `${SERVER_ALIVE_LABEL}${SERVER_FACTS_SEPARATOR}${SERVER_NONE_ANSWERED_LABEL}`;
  }

  return server.isLocal ? SERVER_LOCAL_LABEL : SERVER_REMOTE_LABEL;
}

/** A count in the Ukrainian forms; none at all is said by leaving the fact out, never as a zero. */
function countOf(count: number, forms: [string, string, string]): string | null {
  if (count === 0) {
    return null;
  }

  const [one, few, many] = forms;

  return `${count} ${ukrainianPlural(count, one, few, many)}`;
}
