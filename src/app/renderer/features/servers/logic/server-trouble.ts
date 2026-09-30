import { MCP_ENV_VALUE_MISSING, MCP_SERVER_UNREACHABLE, MCP_TOKEN_MISSING } from "../../../../../contracts";
import type { McpLook } from "../../../interfaces";
import type { ServerTrouble } from "../interfaces";

/**
 * Why a server is not up. «Fell» is one answer among several: a missing token or a variable without a value on this
 * machine also stops it, each with its own sentence and action. Matched on the refusals' own names in the string the
 * main process refused with.
 */
export function serverTrouble(look: McpLook | null): ServerTrouble {
  if (look === null || look.isUp) {
    return null;
  }

  // A server not up is in trouble whether or not it said why; silence is «ПРОЦЕС УПАВ».
  const said = look.failure ?? "";

  if (said.includes(MCP_TOKEN_MISSING)) {
    return {
      kind: "tokenMissing",
      name: null,
    };
  }

  if (said.includes(MCP_ENV_VALUE_MISSING)) {
    return {
      kind: "valueMissing",
      // «НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY»: the name travels with the refusal, since the row names it.
      name: said.split(`${MCP_ENV_VALUE_MISSING}: `)[1]?.trim() ?? null,
    };
  }

  if (said.includes(MCP_SERVER_UNREACHABLE)) {
    return {
      kind: "unreachable",
      name: null,
    };
  }

  return {
    kind: "fell",
    name: null,
  };
}
