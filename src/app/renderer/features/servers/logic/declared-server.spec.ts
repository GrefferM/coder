import { describe, expect, it } from "vitest";
import { declaredServer } from "./declared-server";
import type { ServerFormValues } from "../interfaces";

function filled(patch: Partial<ServerFormValues> = {}): ServerFormValues {
  return {
    name: "  brave  ",
    isLocal: true,
    run: "  npx @modelcontextprotocol/server-brave-search  ",
    address: "  https://mcp.linear.app/sse  ",
    signIn: "token",
    env: ["BRAVE_API_KEY"],
    ...patch,
  };
}

describe("declaredServer", () => {
  it("writes a local server as its line and its variables, with the remote half left empty", () => {
    expect(declaredServer(filled())).toEqual({
      name: "brave",
      isLocal: true,
      run: "npx @modelcontextprotocol/server-brave-search",
      // Empty rather than absent: one shape reads either way round.
      address: "",
      signIn: "none",
      env: ["BRAVE_API_KEY"],
    });
  });

  it("writes a remote server as its address and its way in, with the local half left empty", () => {
    // The form keeps the other kind's typed half; the file keeps none of it.
    expect(
      declaredServer(
        filled({
          isLocal: false,
        }),
      ),
    ).toEqual({
      name: "brave",
      isLocal: false,
      run: "",
      address: "https://mcp.linear.app/sse",
      signIn: "token",
      env: [],
    });
  });

  it("leaves a remote server that asks for nothing asking for nothing", () => {
    // A public server is reached by address alone, with no token named.
    expect(
      declaredServer(
        filled({
          isLocal: false,
          signIn: "none",
        }),
      ).signIn,
    ).toBe("none");
  });
});
