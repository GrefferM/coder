import { describe, expect, it } from "vitest";
import { serverTrouble } from "./server-trouble";
import { NO_MCP_CALLS } from "../../../interfaces";
import type { McpLook } from "../../../interfaces";

function aLook(failure: string | null, isUp = failure === null): McpLook {
  return {
    serverId: "server-1",
    isUp,
    functions: [],
    answeredAt: null,
    failure,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
  };
}

describe("serverTrouble", () => {
  it("says nothing of a server that is up, or of one nobody has asked at all", () => {
    expect(serverTrouble(null)).toBeNull();
    expect(serverTrouble(aLook(null))).toBeNull();
  });

  it("takes a server that is down and said nothing for one that simply fell", () => {
    // Silence is not good health: the row says «ПРОЦЕС УПАВ».
    expect(serverTrouble(aLook(null, false))?.kind).toBe("fell");
  });

  it("tells a server with no token from one that simply fell", () => {
    // Nobody has asked it, so it neither fell nor answered and «ПРОЦЕС УПАВ» would be wrong.
    expect(serverTrouble(aLook("Error: MCP_TOKEN_MISSING"))?.kind).toBe("tokenMissing");
    expect(serverTrouble(aLook("Error: spawn npx ENOENT"))?.kind).toBe("fell");
  });

  it("carries the name of the variable that has no value, because the row names it", () => {
    // «НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY».
    const trouble = serverTrouble(aLook("Error: MCP_ENV_VALUE_MISSING: BRAVE_API_KEY"));

    expect(trouble?.kind).toBe("valueMissing");
    expect(trouble?.name).toBe("BRAVE_API_KEY");
  });

  it("takes a server with no address as unreachable", () => {
    expect(serverTrouble(aLook("Error: MCP_SERVER_UNREACHABLE"))?.kind).toBe("unreachable");
  });
});
