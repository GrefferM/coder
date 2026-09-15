import {
  MCP_ENV_VALUE_MISSING,
  MCP_REMOTE_NOT_BUILT,
  MCP_SERVER_UNREACHABLE,
  MCP_TOKEN_MISSING,
} from "../../../../../contracts";
import type { McpLook } from "../../../interfaces";
import type { ServerTrouble } from "../interfaces";

/**
 * **why** a server is not up. «Fell» is one answer among several and the least useful of them:
 * a server nobody has a token for never started at all, and one whose variable has no value on this machine will
 * not start until it has. Each of those is a different sentence and a different action, and the row says which.
 *
 * The answer comes out of what the main process refused with. It is a string on the wire, and the words of a
 * refusal are its own — so what is matched here are the refusals' own names, which is what they are for.
 */
export function serverTrouble(look: McpLook | null): ServerTrouble {
  if (look === null || look.isUp) {
    return null;
  }

  // A server that is not up is in trouble whether or not it said why: silence is «ПРОЦЕС УПАВ», not good health.
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
      // «НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY» — the name travelled with the refusal, because the row names it.
      name: said.split(`${MCP_ENV_VALUE_MISSING}: `)[1]?.trim() ?? null,
    };
  }

  if (said.includes(MCP_SERVER_UNREACHABLE) || said.includes(MCP_REMOTE_NOT_BUILT)) {
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
