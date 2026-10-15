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
import type { ServerStanding } from "../interfaces";

/**
 * The line under a server's name: what it is, how much it hands over, how many agents hold any of it. A fallen server
 * says so in place of its kind: «ПРОЦЕС УПАВ · 12 ФУНКЦІЙ · 1 АГЕНТ», the count being what it handed over while it
 * stood.
 */
export function serverFacts(server: ProjectMcpServer, stands: ServerStanding): string {
  const { look, clock, functionCount, agentCount } = stands;

  /**
   * No function count while being raised or while a token is missing; a never-asked server has none to show. The
   * agents stay counted.
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

/** What the server is, or what became of it; being asked wins over both. */
function standing(server: ProjectMcpServer, look: McpLook | null, clock: string | null): string {
  if (clock !== null) {
    return `${SERVER_STARTING_LABEL}${SERVER_FACTS_SEPARATOR}${clock}`;
  }

  const trouble = serverTrouble(look);

  if (trouble !== null) {
    // A server that never started is not a fallen one; each reason has its own sentence.
    if (trouble.kind === "tokenMissing") {
      return SERVER_TOKEN_MISSING_LABEL;
    }

    if (trouble.kind === "valueMissing") {
      return `${SERVER_VALUE_MISSING_LABEL}${trouble.name ?? ""}`;
    }

    return trouble.kind === "unreachable" ? SERVER_UNREACHABLE_LABEL : SERVER_FELL_LABEL;
  }

  /** A server not yet raised says so in place of its kind. */
  if (look === null) {
    return SERVER_UNKNOWN_LABEL;
  }

  // A server that works for nobody says so in place of its kind.
  if (noneAnswered(look)) {
    return `${SERVER_ALIVE_LABEL}${SERVER_FACTS_SEPARATOR}${SERVER_NONE_ANSWERED_LABEL}`;
  }

  return server.isLocal ? SERVER_LOCAL_LABEL : SERVER_REMOTE_LABEL;
}

/** A count in Ukrainian forms; zero is left out, never said. */
function countOf(count: number, forms: [string, string, string]): string | null {
  if (count === 0) {
    return null;
  }

  const [one, few, many] = forms;

  return `${count} ${ukrainianPlural(count, one, few, many)}`;
}
