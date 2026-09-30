import { describe, expect, it } from "vitest";
import { serverBlocker } from "./server-blocker";
import type { ServerFormValues } from "../interfaces";

function filled(patch: Partial<ServerFormValues> = {}): ServerFormValues {
  return {
    name: "brave",
    isLocal: true,
    run: "npx -y @modelcontextprotocol/server-brave-search",
    address: "https://mcp.linear.app/sse",
    signIn: "token",
    env: [],
    ...patch,
  };
}

describe("serverBlocker", () => {
  it("asks for nothing where both the name and the half in hand are filled", () => {
    expect(serverBlocker(filled())).toEqual([]);
    expect(
      serverBlocker(
        filled({
          isLocal: false,
        }),
      ),
    ).toEqual([]);
  });

  it("asks only for the half the switch points at", () => {
    // Only the half the switch points at is required; the other half is not owed.
    expect(
      serverBlocker(
        filled({
          run: "   ",
        }),
      ),
    ).toEqual(["рядок запуску"]);
    expect(
      serverBlocker(
        filled({
          isLocal: false,
          run: "   ",
        }),
      ),
    ).toEqual([]);
    expect(
      serverBlocker(
        filled({
          isLocal: false,
          address: "",
        }),
      ),
    ).toEqual(["адреса"]);
  });

  it("asks for the name whichever kind it is", () => {
    expect(
      serverBlocker(
        filled({
          name: "  ",
          run: "",
        }),
      ),
    ).toEqual(["ім'я", "рядок запуску"]);
  });
});
