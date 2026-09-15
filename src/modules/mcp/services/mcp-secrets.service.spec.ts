import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { MCP_ENV_PREFIX, MCP_TOKEN_PREFIX } from "../constants";
import { UNDO_STANDS_MS } from "../../../contracts";
import { McpSecrets } from "./mcp-secrets.service";
import type { McpDroppedStore, McpSecretStore } from "../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const OTHER_SERVER_ID = "88888888-8888-4888-8888-888888888888";

/** The machine's keychain as this service sees it: keys in, keys out, and hints for everything held. */
function aKeychain(held: Map<string, string>): McpSecretStore {
  return {
    value: (key) => Promise.resolve(held.get(key) ?? null),
    set: ({ key, value }) => {
      held.set(key, value);

      return Promise.resolve({
        key,
        hint: value,
      });
    },
    remove: ({ key }) => {
      held.delete(key);

      return Promise.resolve();
    },
    hints: () =>
      Promise.resolve(
        [...held].map(([key, value]) => ({
          key,
          hint: value,
        })),
      ),
  };
}

/** What this machine wrote down about servers deleted here, and nothing else it knows. */
function aDebt(rows: Map<string, number>): McpDroppedStore {
  return {
    all: () =>
      Promise.resolve(
        [...rows].map(([serverId, droppedAt]) => ({
          serverId,
          droppedAt,
        })),
      ),
    put: (serverId, droppedAt) => {
      rows.set(serverId, droppedAt);

      return Promise.resolve();
    },
    forget: (serverIds) => {
      serverIds.forEach((serverId) => rows.delete(serverId));

      return Promise.resolve();
    },
  };
}

describe("McpSecrets", () => {
  let held: Map<string, string>;
  let dropped: Map<string, number>;
  let secrets: McpSecrets;

  beforeEach(() => {
    held = new Map();
    dropped = new Map();
    secrets = new McpSecrets(aKeychain(held), aDebt(dropped));
  });

  it("holds a token by the server's own id, so a rename or a move keeps it", async () => {
    await secrets.saveToken({
      serverId: SERVER_ID,
      value: "sk-the-token",
    });

    assert.equal(held.get(`${MCP_TOKEN_PREFIX}${SERVER_ID}`), "sk-the-token");
  });

  it("holds one variable's value under the server and the variable's own name", async () => {
    await secrets.saveEnvValue({
      serverId: SERVER_ID,
      name: "BRAVE_API_KEY",
      value: "sk-brave",
    });

    assert.equal(held.get(`${MCP_ENV_PREFIX}${SERVER_ID}:BRAVE_API_KEY`), "sk-brave");
  });

  it("takes a value off this machine when the field is emptied, rather than keeping an empty one", async () => {
    // An emptied field removes the value from this machine; a stored "" would read as «вписано».
    await secrets.saveToken({
      serverId: SERVER_ID,
      value: "sk-the-token",
    });
    await secrets.saveToken({
      serverId: SERVER_ID,
      value: "   ",
    });

    assert.equal(held.has(`${MCP_TOKEN_PREFIX}${SERVER_ID}`), false);
  });

  it("says what it holds for one server and never what it is, and answers for that server alone", async () => {
    await secrets.saveToken({
      serverId: SERVER_ID,
      value: "sk-the-token",
    });
    await secrets.saveEnvValue({
      serverId: SERVER_ID,
      name: "BRAVE_API_KEY",
      value: "sk-brave",
    });
    await secrets.saveEnvValue({
      serverId: OTHER_SERVER_ID,
      name: "GITHUB_TOKEN",
      value: "ghp-other",
    });

    const mine = await secrets.held({
      serverId: SERVER_ID,
    });

    // A hint and nothing more: enough to recognise which key is in there, never enough to be the key.
    assert.equal(mine.token, "sk-the-token");
    assert.deepEqual(Object.keys(mine.env), ["BRAVE_API_KEY"]);
    assert.equal(Object.keys(mine.env).includes("GITHUB_TOKEN"), false);
  });

  it("holds nothing for a server nobody has typed anything in for", async () => {
    const none = await secrets.held({
      serverId: SERVER_ID,
    });

    assert.equal(none.token, null);
    assert.deepEqual(none.env, {});
  });

  it("writes the debt down at the press, and takes nothing off the machine yet", async () => {
    // The undo has thirty seconds, and ⌘Z must hand the server back **with** its keys.
    await secrets.saveToken({
      serverId: SERVER_ID,
      value: "sk-the-token",
    });
    await secrets.drop(SERVER_ID);

    assert.equal(held.get(`${MCP_TOKEN_PREFIX}${SERVER_ID}`), "sk-the-token");
    assert.deepEqual([...dropped.keys()], [SERVER_ID]);
  });

  it("sweeps the token and every value of a server the undo did not bring back", async () => {
    await secrets.saveToken({
      serverId: SERVER_ID,
      value: "sk-the-token",
    });
    await secrets.saveEnvValue({
      serverId: SERVER_ID,
      name: "BRAVE_API_KEY",
      value: "sk-brave",
    });
    await secrets.drop(SERVER_ID);
    dropped.set(SERVER_ID, Date.now() - UNDO_STANDS_MS);

    await secrets.sweep([]);

    assert.deepEqual([...held.keys()], []);
    // The debt is paid and is not carried into the next opening of the project.
    assert.deepEqual([...dropped.keys()], []);
  });

  it("keeps the keys of a server the undo brought back, and cancels the debt", async () => {
    await secrets.saveToken({
      serverId: SERVER_ID,
      value: "sk-the-token",
    });
    await secrets.drop(SERVER_ID);
    dropped.set(SERVER_ID, Date.now() - UNDO_STANDS_MS);

    await secrets.sweep([SERVER_ID]);

    assert.equal(held.get(`${MCP_TOKEN_PREFIX}${SERVER_ID}`), "sk-the-token");
    assert.deepEqual([...dropped.keys()], []);
  });

  it("holds the keys until the undo has run out, however often the sweep is asked", async () => {
    await secrets.saveToken({
      serverId: SERVER_ID,
      value: "sk-the-token",
    });
    await secrets.drop(SERVER_ID);

    await secrets.sweep([]);

    assert.equal(held.get(`${MCP_TOKEN_PREFIX}${SERVER_ID}`), "sk-the-token");
    assert.deepEqual([...dropped.keys()], [SERVER_ID]);
  });

  it("never touches a server it did not drop, since the keychain holds other projects too", async () => {
    // A rule of «not in this project» would take a colleague's token off with it; only a written debt is swept.
    await secrets.saveToken({
      serverId: OTHER_SERVER_ID,
      value: "sk-another-project",
    });

    await secrets.sweep([]);

    assert.equal(held.get(`${MCP_TOKEN_PREFIX}${OTHER_SERVER_ID}`), "sk-another-project");
  });
});
