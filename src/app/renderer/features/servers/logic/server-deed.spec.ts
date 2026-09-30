import { describe, expect, it } from "vitest";
import { serverDeed } from "./server-deed";
import { NO_MCP_CALLS } from "../../../interfaces";
import type { McpLook } from "../../../interfaces";

function aLook(patch: Partial<McpLook> = {}): McpLook {
  return {
    serverId: "server-1",
    isUp: true,
    functions: [],
    answeredAt: 1_700_000_000_000,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
    ...patch,
  };
}

describe("serverDeed", () => {
  it("offers nothing in the head of a row whose server simply stands answering", () => {
    // An answering server offers nothing in the head; its process actions are on its page.
    expect(serverDeed(aLook())).toBeNull();
  });

  it("offers to raise one that never rose and one that fell, since both ask the same of a hand", () => {
    expect(serverDeed(null)).toBe("raise");
    expect(
      serverDeed(
        aLook({
          isUp: false,
          failure: "Error: spawn npx ENOENT",
        }),
      ),
    ).toBe("raise");
  });

  it("offers to fill in what is missing rather than to raise it again on the same hole", () => {
    // Restarting without the missing thing fails the same way.
    expect(
      serverDeed(
        aLook({
          isUp: false,
          failure: "Error: MCP_TOKEN_MISSING",
        }),
      ),
    ).toBe("fill");
    expect(
      serverDeed(
        aLook({
          isUp: false,
          failure: "Error: MCP_ENV_VALUE_MISSING: BRAVE_API_KEY",
        }),
      ),
    ).toBe("fill");
  });

  it("offers a fresh connection to one that answers and works for nobody", () => {
    // It never fell, so it is restarted, not started.
    expect(
      serverDeed(
        aLook({
          calls: {
            ...NO_MCP_CALLS,
            failedInARow: 3,
            hasWorked: false,
          },
        }),
      ),
    ).toBe("raiseAgain");
  });
});
