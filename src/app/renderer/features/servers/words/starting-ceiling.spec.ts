import { describe, expect, it } from "vitest";
import { startingCeiling } from "./starting-ceiling";
import { MCP_CONNECT_TIMEOUT_MS } from "../../../../../contracts";

describe("startingCeiling", () => {
  it("says the ceiling from the timer the handshake actually keeps", () => {
    expect(startingCeiling()).toBe("СПИНИМО ЧЕРЕЗ 2 ХВ");
    // The sentence is only honest while these two agree, so the test names the timer and not the number.
    expect(MCP_CONNECT_TIMEOUT_MS).toBe(2 * 60 * 1000);
  });
});
