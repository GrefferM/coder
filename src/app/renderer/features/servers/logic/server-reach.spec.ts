import { describe, expect, it } from "vitest";
import { serverReach } from "./server-reach";
import type { ProjectMcpServer } from "../../../interfaces";

function aServer(patch: Partial<ProjectMcpServer> = {}): ProjectMcpServer {
  return {
    id: "99999999-9999-4999-8999-999999999999",
    name: "filesystem",
    isLocal: true,
    run: "npx server-filesystem .",
    address: "",
    signIn: "none",
    env: [],
    ...patch,
  };
}

describe("serverReach", () => {
  it("reads the same for a server renamed and nothing else", () => {
    expect(
      serverReach(
        aServer({
          name: "files",
        }),
      ),
    ).toBe(serverReach(aServer()));
  });

  it("reads differently for every part of the way to it", () => {
    // Each change is a different server behind the same id.
    const ways = [
      aServer({
        isLocal: false,
        run: "",
        address: "https://mcp.linear.app/sse",
      }),
      aServer({
        run: "npx server-filesystem /tmp",
      }),
      aServer({
        signIn: "token",
      }),
      aServer({
        env: ["BRAVE_API_KEY"],
      }),
    ].map(serverReach);

    expect(new Set([serverReach(aServer()), ...ways]).size).toBe(ways.length + 1);
  });
});
