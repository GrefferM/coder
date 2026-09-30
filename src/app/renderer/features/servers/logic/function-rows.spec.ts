import { describe, expect, it } from "vitest";
import { functionRows } from "./function-rows";
import { anAgent } from "../../../testing";
import { NO_MCP_CALLS } from "../../../interfaces";
import type { Agent, McpLook } from "../../../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function aLook(patch: Partial<McpLook> = {}): McpLook {
  return {
    serverId: SERVER_ID,
    isUp: true,
    functions: [
      {
        name: "pulls.list",
        description: "Список пул-реквестів",
        parameters: {},
      },
      {
        name: "pulls.create",
        description: "Відкрити пул-реквест",
        parameters: {},
      },
    ],
    answeredAt: 1_700_000_000_000,
    failure: null,
    changedAt: null,
    wasCount: null,
    calls: NO_MCP_CALLS,
    ...patch,
  };
}

function holding(id: string, names: string[], serverId = SERVER_ID): Agent {
  return anAgent({
    id,
    tools: names.map((name, at) => ({
      id: `grant-${id}-${at}`,
      source: "mcp" as const,
      serverId,
      functionName: name,
    })),
  });
}

describe("functionRows", () => {
  it("stands the functions by name, so the list does not move about between looks", () => {
    expect(functionRows(SERVER_ID, aLook(), []).map((row) => row.name)).toEqual(["pulls.create", "pulls.list"]);
  });

  it("counts the agents holding each function, and says nothing where none holds it", () => {
    // «N АГ.» is a count, not a tick.
    const rows = functionRows(SERVER_ID, aLook(), [
      holding("agent-1", ["pulls.list"]),
      holding("agent-2", ["pulls.list"]),
    ]);

    expect(rows.find((row) => row.name === "pulls.list")?.agents).toBe(2);
    expect(rows.find((row) => row.name === "pulls.create")?.agents).toBe(0);
  });

  it("counts one agent once, however many grants it holds on the same function", () => {
    const rows = functionRows(SERVER_ID, aLook(), [holding("agent-1", ["pulls.list", "pulls.list"])]);

    expect(rows.find((row) => row.name === "pulls.list")?.agents).toBe(1);
  });

  it("counts nobody from another server, since a grant is held on a server by its id alone", () => {
    const rows = functionRows(SERVER_ID, aLook(), [holding("agent-1", ["pulls.list"], OTHER_ID)]);

    expect(rows.find((row) => row.name === "pulls.list")?.agents).toBe(0);
  });

  it("says nothing of a grant pointing at a name the server no longer hands over", () => {
    // A grant on a function the server no longer names is not listed; it is the agent's trouble.
    const rows = functionRows(SERVER_ID, aLook(), [holding("agent-1", ["pulls.merge"])]);

    expect(rows.map((row) => row.name)).toEqual(["pulls.create", "pulls.list"]);
  });

  it("gives a server that did not answer no lines at all", () => {
    // A fallen server hands nothing over this time, which is not its functions being gone.
    const rows = functionRows(
      SERVER_ID,
      aLook({
        isUp: false,
        functions: [],
      }),
      [holding("agent-1", ["pulls.list"])],
    );

    expect(rows).toEqual([]);
  });

  it("gives a server nobody has asked yet no lines either", () => {
    expect(functionRows(SERVER_ID, null, [holding("agent-1", ["pulls.list"])])).toEqual([]);
  });
});
