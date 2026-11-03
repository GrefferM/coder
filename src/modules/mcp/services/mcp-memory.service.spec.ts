import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { McpMemory } from "./mcp-memory.service";
import type { McpFunction, McpLookMemory, McpLookStore } from "../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";

/** An in-memory stand-in for the store: one row and whatever the service asks of it. */
function store(): McpLookStore & { held: () => McpLookMemory | null } {
  let row: McpLookMemory | null = null;

  return {
    of: (serverId) => Promise.resolve(row !== null && row.serverId === serverId ? row : null),
    put: (memory) => {
      row = memory;

      return Promise.resolve();
    },
    held: () => row,
  };
}

const given = (...names: string[]): McpFunction[] =>
  names.map((name) => ({
    name,
    description: "",
    parameters: {},
  }));

describe("McpMemory", () => {
  it("says nothing about a server this machine is meeting for the first time", async () => {
    // A change needs two looks: «оновлено щойно» on a first meeting would be false.
    const held = store();
    const memory = new McpMemory(held);

    assert.deepEqual(await memory.after(SERVER_ID, given("read", "write")), {
      changedAt: null,
      wasCount: null,
    });
    assert.deepEqual(held.held()?.names, ["read", "write"]);
  });

  it("says nothing while the list is the same one, whatever order it comes in", async () => {
    // The server's order means nothing: the same names are the same list.
    const memory = new McpMemory(store());

    await memory.after(SERVER_ID, given("read", "write"));

    assert.deepEqual(await memory.after(SERVER_ID, given("write", "read")), {
      changedAt: null,
      wasCount: null,
    });
  });

  it("names the moment and the count it used to be, once the list differs", async () => {
    const memory = new McpMemory(store());

    await memory.after(SERVER_ID, given("read", "write", "watch"));

    const said = await memory.after(SERVER_ID, given("read", "write"));

    assert.equal(said.wasCount, 3);
    assert.ok(said.changedAt !== null);
  });

  it("keeps the first count through a second change nobody has looked at yet", async () => {
    // The arrow starts from the count before the first unread change: 34 → 33 → 32 is still 34 → 32.
    const memory = new McpMemory(store());

    await memory.after(SERVER_ID, given("a", "b", "c"));
    await memory.after(SERVER_ID, given("a", "b"));

    assert.equal((await memory.after(SERVER_ID, given("a"))).wasCount, 3);
  });

  it("holds the news until the page is opened, and lets go of it then", async () => {
    const memory = new McpMemory(store());

    await memory.after(SERVER_ID, given("a", "b"));
    await memory.after(SERVER_ID, given("a"));
    await memory.seen(SERVER_ID);

    const said = await memory.after(SERVER_ID, given("a"));

    assert.equal(said.wasCount, null);
    // What changed and when stays: «оновлено» holds until it changes again.
    assert.ok(said.changedAt !== null);
  });
});
