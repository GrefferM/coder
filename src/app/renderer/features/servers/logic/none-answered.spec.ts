import { describe, expect, it } from "vitest";
import { noneAnswered } from "./none-answered";
import { NO_MCP_CALLS } from "../../../interfaces";
import type { McpCallsState, McpLook } from "../../../interfaces";

const SERVER_ID = "88888888-8888-4888-8888-888888888888";

function look(calls: Partial<McpCallsState> = {}, isUp = true): McpLook {
  return {
    serverId: SERVER_ID,
    isUp,
    functions: [],
    answeredAt: 1_700_000_000_000,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: {
      ...NO_MCP_CALLS,
      ...calls,
    },
  };
}

describe("noneAnswered", () => {
  it("says nothing of a server nobody has called", () => {
    expect(noneAnswered(look())).toBe(false);
  });

  it("waits for three, and does not say it at two", () => {
    // «межа названа числом: три невдалі поспіль» — two is a bad afternoon, not a broken server.
    expect(
      noneAnswered(
        look({
          failedInARow: 2,
        }),
      ),
    ).toBe(false);
    expect(
      noneAnswered(
        look({
          failedInARow: 3,
        }),
      ),
    ).toBe(true);
  });

  it("says nothing where a call has worked, however many failed after it", () => {
    // The failures then say something about a page or an argument, and not about the server.
    expect(
      noneAnswered(
        look({
          failedInARow: 9,
          hasWorked: true,
        }),
      ),
    ).toBe(false);
  });

  it("says nothing of a server that fell, because that is «ПРОЦЕС УПАВ» and a different row", () => {
    expect(
      noneAnswered(
        look(
          {
            failedInARow: 5,
          },
          false,
        ),
      ),
    ).toBe(false);
  });

  it("says nothing of a server not asked yet", () => {
    expect(noneAnswered(null)).toBe(false);
  });
});
