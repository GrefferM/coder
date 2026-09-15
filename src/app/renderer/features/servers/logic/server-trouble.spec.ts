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
    // Silence is not good health: the row must say «ПРОЦЕС УПАВ» about it and not name the kind of server it is.
    expect(serverTrouble(aLook(null, false))?.kind).toBe("fell");
  });

  it("tells a server with no token from one that simply fell", () => {
    // It neither fell nor answered — nobody has asked it, and «ПРОЦЕС УПАВ» would be a lie about it.
    expect(serverTrouble(aLook("Error: MCP_TOKEN_MISSING"))?.kind).toBe("tokenMissing");
    expect(serverTrouble(aLook("Error: spawn npx ENOENT"))?.kind).toBe("fell");
  });

  it("carries the name of the variable that has no value, because the row names it", () => {
    // «НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY».
    const trouble = serverTrouble(aLook("Error: MCP_ENV_VALUE_MISSING: BRAVE_API_KEY"));

    expect(trouble?.kind).toBe("valueMissing");
    expect(trouble?.name).toBe("BRAVE_API_KEY");
  });

  it("takes a server with no address, and the way in that is not built, as unreachable", () => {
    expect(serverTrouble(aLook("Error: MCP_SERVER_UNREACHABLE"))?.kind).toBe("unreachable");
    expect(serverTrouble(aLook("Error: MCP_REMOTE_NOT_BUILT"))?.kind).toBe("unreachable");
  });
});
