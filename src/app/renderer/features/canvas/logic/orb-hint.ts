import { ukrainianPlural } from "../../../utils/text";
import { isAgentGrant, pointsAt } from "../../../interfaces";
import {
  ORB_HINT_AGENT_KIND,
  ORB_HINT_BROKEN_FORMS,
  ORB_HINT_COMMAND_KIND,
  ORB_HINT_FUNCTION_FORMS,
  ORB_HINT_GONE_AGENT,
  ORB_HINT_GONE_COMMAND,
  ORB_HINT_GONE_NAME,
  ORB_HINT_OF,
  ORB_HINT_REST_KIND,
  ORB_HINT_SEPARATOR,
  ORB_HINT_SERVER_KIND,
  ORB_HINT_SOURCE_FORMS,
} from "../constants";
import { AGENTS_GROUP_KEY, COMMANDS_GROUP_KEY, SERVER_GROUP_PREFIX } from "../../../constants";
import { sourceOfGroup } from "./source-of-group";
import type { ArmedFold, OrbHint } from "../interfaces";
import type { GrantTargets } from "../../../interfaces";
import type { ToolGrant } from "../../../interfaces";

/**
 * What one mini-sphere says under the cursor. A server names itself and counts what is granted
 * against what it hands over; a command says its own name and **no number** — one command is one mark, and a
 * «1 з 7» on it would be counting the project's declarations rather than saying what this mark is.
 *
 * What a server does not do is name its functions — «24 імені в підказку не влазять і не для того вона».
 */
export function orbHint(group: string, granted: ToolGrant[], said: GrantTargets): OrbHint {
  if (group === COMMANDS_GROUP_KEY) {
    return {
      kind: ORB_HINT_COMMAND_KIND,
      // The name is the whole of what a command is here: it is one line in the project's own file.
      name: nameOfCommand(granted[0] ?? null, said) ?? ORB_HINT_GONE_COMMAND,
      count: "",
      lines: [],
    };
  }

  if (group === AGENTS_GROUP_KEY) {
    return {
      kind: ORB_HINT_AGENT_KIND,
      // An agent is one mark, named by its own name.
      name: nameOfAgent(granted[0] ?? null, said) ?? ORB_HINT_GONE_AGENT,
      count: "",
      lines: [],
    };
  }

  const serverId = group.slice(SERVER_GROUP_PREFIX.length);
  const server = said.servers.find((standing) => standing.id === serverId) ?? null;
  const handsOver = said.looks[serverId]?.functions.length ?? 0;

  return {
    kind: ORB_HINT_SERVER_KIND,
    // A server the project let go still stands on the arc until the grant is taken back, and says so.
    name: server?.name ?? ORB_HINT_GONE_NAME,
    count: countOfFunctions(granted.length, handsOver),
    lines: [],
  };
}

/**
 * What a порода's «+» says — «ЩЕ 3 СЕРВЕРИ», and a line for each mark behind it. It counts one порода
 * and never the rest of the sources together, because it wears that порода's own shape: a command folded is named
 * by its name, a server by its name and its count.
 *
 * Where something behind it is broken the head says so too — «ЩЕ 3 СЕРВЕРИ · 1 ЗЛАМАНИЙ». The heap
 * carries two things now, its number and its state, and the number alone would have hidden the state that the
 * hard two places pushed under it.
 */
export function foldHint(folded: ArmedFold[], broken: number, said: GrantTargets): OrbHint {
  const source = sourceOfGroup(folded[0].group);
  const [one, few, many] = ORB_HINT_SOURCE_FORMS[source];
  const [oneBroken, fewBroken, manyBroken] = ORB_HINT_BROKEN_FORMS;
  const says = `${ORB_HINT_REST_KIND} ${folded.length} ${ukrainianPlural(folded.length, one, few, many)}`;
  const alarm =
    broken === 0 ? "" : `${ORB_HINT_SEPARATOR}${broken} ${ukrainianPlural(broken, oneBroken, fewBroken, manyBroken)}`;

  return {
    kind: `${says}${alarm}`.toUpperCase(),
    name: "",
    count: "",
    lines: folded.flatMap((mark) => {
      const hint = orbHint(mark.group, mark.granted, said);

      // A server is named with its count; a command and an agent by name alone.
      return source === "mcp"
        ? [[hint.name, hint.count].filter((part) => part !== "").join(ORB_HINT_SEPARATOR)]
        : [hint.name];
    }),
  };
}

/** «run_test» — a granted command is named by the name the project gave it, and by nothing else. */
function nameOfCommand(grant: ToolGrant | null, said: GrantTargets): string | null {
  if (grant === null) {
    return null;
  }

  return said.commands.find((one) => pointsAt(grant, one.id))?.name ?? null;
}

/** An agent granted as a tool is named by its own name. */
function nameOfAgent(grant: ToolGrant | null, said: GrantTargets): string | null {
  if (grant === null || !isAgentGrant(grant)) {
    return null;
  }

  return said.agents.find((one) => one.id === grant.agentId)?.name ?? null;
}

/** «2 з 33 функцій» — what is granted against what the server said it hands over, in the forms a number takes. */
function countOfFunctions(granted: number, handsOver: number): string {
  const [one, few, many] = ORB_HINT_FUNCTION_FORMS;

  return `${granted}${ORB_HINT_OF}${handsOver} ${ukrainianPlural(handsOver, one, few, many)}`;
}
