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
 * What one mini-sphere says under the cursor. A server gives its name and granted-against-offered count; a command
 * gives its name and no number. Function names are never listed.
 */
export function orbHint(group: string, granted: ToolGrant[], said: GrantTargets): OrbHint {
  if (group === COMMANDS_GROUP_KEY) {
    return {
      kind: ORB_HINT_COMMAND_KIND,
      // A command is just its name, one line in the project file.
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
    // A server the project dropped still stands on the arc until the grant is taken back.
    name: server?.name ?? ORB_HINT_GONE_NAME,
    count: countOfFunctions(granted.length, handsOver),
    lines: [],
  };
}

/**
 * What a kind's «+» says: «ЩЕ 3 СЕРВЕРИ», plus a line per mark behind it; a broken count is appended: «ЩЕ 3 СЕРВЕРИ · 1
 * ЗЛАМАНИЙ».
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

/** A granted command is named by the name the project gave it. */
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

/** «2 з 33 функцій»: granted against what the server offers. */
function countOfFunctions(granted: number, handsOver: number): string {
  const [one, few, many] = ORB_HINT_FUNCTION_FORMS;

  return `${granted}${ORB_HINT_OF}${handsOver} ${ukrainianPlural(handsOver, one, few, many)}`;
}
