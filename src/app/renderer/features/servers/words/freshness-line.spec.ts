import { describe, expect, it } from "vitest";
import { freshnessLine } from "./freshness-line";
import { NO_MCP_CALLS } from "../../../interfaces";
import type { McpLook } from "../../../interfaces";

function aLook(patch: Partial<McpLook> = {}): McpLook {
  return {
    serverId: "99999999-9999-4999-8999-999999999999",
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

const given = (count: number) =>
  Array.from(
    {
      length: count,
    },
    (_unused, at) => ({
      name: `f${at}`,
      description: "",
      parameters: {},
    }),
  );

describe("freshnessLine", () => {
  it("says the whole of the line when every part has something to say", () => {
    expect(
      freshnessLine(
        aLook({
          functions: given(33),
          wasCount: 34,
        }),
        "2 хв тому",
        "вчора",
      ),
    ).toBe("Відповів 2 хв тому · оновлено вчора · 34 → 33");
  });

  it("stands on the answer alone where this machine has no memory of the server yet", () => {
    // A change needs two looks, and the arrow needs a change: a first meeting has neither.
    expect(freshnessLine(aLook(), "щойно", null)).toBe("Відповів щойно");
  });

  it("keeps «оновлено» after the news of the arrow has been read", () => {
    // The arrow is news and goes out when the page opens; «оновлено» is a fact and stays.
    expect(freshnessLine(aLook(), "щойно", "вчора")).toBe("Відповів щойно · оновлено вчора");
  });

  it("has no line at all where there was no answer, rather than standing with a dash", () => {
    // No dash for an unanswered server; there is no line.
    expect(freshnessLine(aLook(), null, "вчора")).toBeNull();
    expect(freshnessLine(null, "щойно", null)).toBeNull();
  });
});
