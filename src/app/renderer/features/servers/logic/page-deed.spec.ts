import { describe, expect, it } from "vitest";
import { pageDeed } from "./page-deed";
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

describe("pageDeed", () => {
  it("takes the word from the kind, because the kind decides the thing", () => {
    // A local server is raised afresh; a remote one is asked again.
    expect(pageDeed(aLook(), true, false)).toBe("raiseAgain");
    expect(pageDeed(aLook(), false, false)).toBe("askAgain");
  });

  it("offers to raise one that fell and one that never rose, whatever kind it is", () => {
    expect(
      pageDeed(
        aLook({
          isUp: false,
          failure: "Error: spawn npx ENOENT",
        }),
        true,
        false,
      ),
    ).toBe("raise");
    expect(pageDeed(null, false, false)).toBe("raise");
  });

  it("offers nothing about the process where the hole is a missing token or value", () => {
    // A missing token or value offers no process action; «Змінити» in the page foot fixes it.
    expect(
      pageDeed(
        aLook({
          isUp: false,
          failure: "Error: MCP_TOKEN_MISSING",
        }),
        false,
        false,
      ),
    ).toBeNull();
  });

  it("offers nothing while it is being raised, since that is already happening", () => {
    expect(pageDeed(null, true, true)).toBeNull();
  });
});
