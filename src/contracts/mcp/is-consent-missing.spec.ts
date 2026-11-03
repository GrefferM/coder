import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isConsentMissing } from "./is-consent-missing";
import { NO_MCP_CALLS } from "./no-calls.constant";
import type { McpLook } from "./mcp-look.interface";

function look(patch: Partial<McpLook> = {}): McpLook {
  return {
    serverId: "88888888-8888-4888-8888-888888888888",
    isUp: false,
    functions: [],
    answeredAt: null,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
    ...patch,
  };
}

describe("isConsentMissing", () => {
  it("knows a look refused because the run line is not agreed to, whatever words ride after the code", () => {
    assert.equal(
      isConsentMissing(
        look({
          failure: "Error: MCP_CONSENT_MISSING",
        }),
      ),
      true,
    );
  });

  it("does not take a fallen server for one waiting for consent", () => {
    assert.equal(
      isConsentMissing(
        look({
          failure: "MCP error -32000: Connection closed",
        }),
      ),
      false,
    );
  });

  it("does not take a server that is up for one waiting for consent", () => {
    assert.equal(
      isConsentMissing(
        look({
          isUp: true,
          answeredAt: 1_700_000_000_000,
        }),
      ),
      false,
    );
  });
});
