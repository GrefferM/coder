import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  MCP_EMPTY_OUTPUT_NOTE,
  MCP_FAILED_PREFIX,
  MCP_KIND_SLOT,
  MCP_NOT_TEXT_NOTE,
  MCP_REMOTE_NOT_BUILT,
  MCP_ENV_PREFIX,
  MCP_ENV_VALUE_MISSING,
  MCP_SERVER_UNREACHABLE,
  MCP_TOKEN_MISSING,
  MCP_TOKEN_PREFIX,
} from "../constants";
import { McpClient } from "./mcp-client.service";
import type { ProjectMcpServerDto } from "../../projects";
import type { McpSecretStore } from "../interfaces";

const SERVER_ID = "99999999-9999-4999-8999-999999999999";
const STUB = path.join(__dirname, "..", "testing", "stub-server.cjs");

function aServer(patch: Partial<ProjectMcpServerDto> = {}): ProjectMcpServerDto {
  // No cast here: a field added to the server is a field this fixture must answer for, and a cast would hide it.
  return {
    id: SERVER_ID,
    name: "stub",
    isLocal: true,
    run: `node "${STUB}"`,
    address: "",
    signIn: "none",
    env: [],
    ...patch,
  };
}

/** The machine's keychain, as far as this client is concerned — read by key, or nothing. */
const held = new Map<string, string>();
const keychain: McpSecretStore = {
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

describe("McpClient", () => {
  let client: McpClient;
  let directory: string;

  beforeEach(async () => {
    held.clear();
    client = new McpClient(keychain);
    directory = await mkdtemp(path.join(os.tmpdir(), "coder-mcp-"));
  });

  afterEach(async () => {
    await client.closeAll();
  });

  it("asks the server itself what it hands over, and names each function as the server named it", async () => {
    const functions = await client.functionsOf(aServer(), directory);

    assert.deepEqual(
      functions.map((held) => held.name),
      ["read_file", "list_roots"],
    );
    assert.equal(functions[0].description, "Читає файл.");
    assert.deepEqual(functions[0].parameters.required, ["path"]);
  });

  it("leaves a function the server did not describe without a description, rather than inventing one", async () => {
    const functions = await client.functionsOf(aServer(), directory);

    assert.equal(functions[1].description, "");
  });

  it("holds a server open once it has answered, so asking twice starts one process", async () => {
    const starts = path.join(directory, "starts.txt");

    await writeFile(starts, "", "utf8");

    const server = aServer({
      run: `node "${STUB}" "${starts}"`,
    });

    await client.functionsOf(server, directory);
    await client.functionsOf(server, directory);

    assert.equal((await readFile(starts, "utf8")).trim().split("\n").length, 1);
    assert.equal(client.isUp(SERVER_ID), true);
  });

  it("lets a server go, and the next ask starts it again", async () => {
    const starts = path.join(directory, "starts.txt");

    await writeFile(starts, "", "utf8");

    const server = aServer({
      run: `node "${STUB}" "${starts}"`,
    });

    await client.functionsOf(server, directory);
    await client.close(SERVER_ID);

    assert.equal(client.isUp(SERVER_ID), false);

    await client.functionsOf(server, directory);

    assert.equal((await readFile(starts, "utf8")).trim().split("\n").length, 2);
  });

  it("holds two servers apart by id, and never by the line they run", async () => {
    const other = aServer({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });

    await client.functionsOf(aServer(), directory);
    await client.functionsOf(other, directory);

    assert.equal(client.isUp(SERVER_ID), true);
    assert.equal(client.isUp(other.id), true);
  });

  it("letting a server go that was never up is not an error", async () => {
    await client.close(SERVER_ID);

    assert.equal(client.isUp(SERVER_ID), false);
  });

  it("refuses a remote server rather than pretending to reach one", async () => {
    await assert.rejects(
      () =>
        client.functionsOf(
          aServer({
            isLocal: false,
            run: "",
            address: "https://mcp.example.com/sse",
            signIn: "browser",
          }),
          directory,
        ),
      new RegExp(MCP_REMOTE_NOT_BUILT),
    );
  });

  it("will not start a local server whose declared variable this machine has no value for, and names it", async () => {
    // «НЕ ЗАПУСТИТЬСЯ · НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY». The process must not exist to say this, or it
    // says it later, elsewhere, and in the server's own words rather than ours.
    await assert.rejects(
      () =>
        client.functionsOf(
          aServer({
            env: ["BRAVE_API_KEY"],
          }),
          directory,
        ),
      new RegExp(`${MCP_ENV_VALUE_MISSING}: BRAVE_API_KEY`),
    );
  });

  it("starts a local server with the values this machine holds, each under its own name", async () => {
    // The name rides in the project file and the value never does, so the two meet only here, at the start.
    const starts = path.join(directory, "starts.txt");

    held.set(`${MCP_ENV_PREFIX}${SERVER_ID}:BRAVE_API_KEY`, "sk-brave");
    await writeFile(starts, "", "utf8");
    await client.functionsOf(
      aServer({
        run: `node "${STUB}" "${starts}" BRAVE_API_KEY`,
        env: ["BRAVE_API_KEY"],
      }),
      directory,
    );

    assert.equal((await readFile(starts, "utf8")).trim(), "start sk-brave");
  });

  it("refuses a remote server signed in to by token when this machine holds none", async () => {
    // Neither fallen nor misaddressed — there is nothing to go with, and the words say which it is.
    await assert.rejects(
      () =>
        client.functionsOf(
          aServer({
            isLocal: false,
            run: "",
            address: "https://mcp.example.com/mcp",
            signIn: "token",
          }),
          directory,
        ),
      new RegExp(MCP_TOKEN_MISSING),
    );
  });

  it("goes to the address with the token this machine holds, and no longer refuses on its own account", async () => {
    // What the address answers is the address's business; what is settled here is that the token was found and
    // the client went. It is held by the server's id, so a rename or a move keeps it.
    held.set(`${MCP_TOKEN_PREFIX}${SERVER_ID}`, "sk-the-token");

    const look = await client.look(
      aServer({
        isLocal: false,
        run: "",
        address: "https://mcp.example.invalid/mcp",
        signIn: "token",
      }),
      directory,
    );

    assert.equal(look.isUp, false);
    assert.doesNotMatch(<string>look.failure, new RegExp(MCP_TOKEN_MISSING));
    assert.doesNotMatch(<string>look.failure, new RegExp(MCP_REMOTE_NOT_BUILT));
  });

  it("refuses a remote server with no address to reach it at", async () => {
    await assert.rejects(
      () =>
        client.functionsOf(
          aServer({
            isLocal: false,
            run: "",
            address: "",
            signIn: "token",
          }),
          directory,
        ),
      new RegExp(MCP_SERVER_UNREACHABLE),
    );
  });

  it("refuses a local server with no line to start it", async () => {
    await assert.rejects(
      () =>
        client.functionsOf(
          aServer({
            run: "   ",
          }),
          directory,
        ),
      new RegExp(MCP_SERVER_UNREACHABLE),
    );
  });

  it("does not hold a server that never answered, so the next ask tries again", async () => {
    const server = aServer({
      run: "coder-no-such-program-anywhere",
    });

    await assert.rejects(() => client.functionsOf(server, directory));
    assert.equal(client.isUp(SERVER_ID), false);
  });

  it("a look at a live server says it is up, what it hands over, and when it answered", async () => {
    const before = Date.now();
    const look = await client.look(aServer(), directory);

    assert.equal(look.serverId, SERVER_ID);
    assert.equal(look.isUp, true);
    assert.deepEqual(
      look.functions.map((held) => held.name),
      ["read_file", "list_roots"],
    );
    assert.equal(look.failure, null);
    assert.equal((look.answeredAt ?? 0) >= before, true);
  });

  it("a look at a server that will not start is not an error to anybody: it is drawn fallen", async () => {
    const look = await client.look(
      aServer({
        run: "coder-no-such-program-anywhere",
      }),
      directory,
    );

    assert.equal(look.isUp, false);
    // What it handed over last time is not repeated as if it still did.
    assert.deepEqual(look.functions, []);
    assert.equal(look.answeredAt, null);
    assert.equal(typeof look.failure, "string");
  });

  it("a look at a server that would not start carries what the server itself printed", async () => {
    const look = await client.look(
      aServer({
        // A server that says why it will not start, the way a package manager or a wrong flag does.
        run: "node -e \"process.stderr.write('немає такого пакета'); process.exit(1);\"",
      }),
      directory,
    );

    assert.equal(look.isUp, false);
    // Without these words a fallen row is a dead end: the library's own error names no cause at all.
    assert.match(<string>look.failure, /немає такого пакета/);
  });

  it("a look at a remote server says why in words, and says it is not up", async () => {
    const look = await client.look(
      aServer({
        isLocal: false,
        run: "",
        address: "https://mcp.example.com/sse",
        signIn: "browser",
      }),
      directory,
    );

    assert.equal(look.isUp, false);
    assert.match(<string>look.failure, new RegExp(MCP_REMOTE_NOT_BUILT));
  });

  it("calls a function by the name the server gave it, and brings back what it said", async () => {
    const result = await client.call({
      server: aServer(),
      directory,
      callId: "call-1",
      functionName: "read_file",
      arguments: {
        path: "README.md",
      },
    });

    assert.equal(result.output, "read README.md");
    assert.equal(result.isFailed, false);
  });

  it("names a part of the answer that is not text, rather than dropping it", async () => {
    const result = await client.call({
      server: aServer(),
      directory,
      callId: "call-2",
      functionName: "list_roots",
      arguments: {},
    });

    // The model is told something came and what kind it was; nothing but text can reach it.
    assert.equal(result.output, `one\n${MCP_NOT_TEXT_NOTE.replace(MCP_KIND_SLOT, "image")}\ntwo`);
    assert.equal(result.isFailed, false);
  });

  it("says so when a function answered with nothing at all", async () => {
    const result = await client.call({
      server: aServer(),
      directory,
      callId: "call-3",
      functionName: "says_nothing",
      arguments: {},
    });

    assert.equal(result.output, MCP_EMPTY_OUTPUT_NOTE);
    assert.equal(result.isFailed, false);
  });

  it("takes a failure the server itself names as the function going wrong, and hands the words on", async () => {
    const result = await client.call({
      server: aServer(),
      directory,
      callId: "call-4",
      functionName: "goes_wrong",
      arguments: {},
    });

    assert.equal(result.output, "немає такого файлу");
    assert.equal(result.isFailed, true);
  });

  it("counts what the calls to a server came to, since no catalogue can say it", async () => {
    // The server hands over its functions and fails a call in the same breath; only the calls say so.
    await client.call({
      server: aServer(),
      directory,
      callId: "call-5",
      functionName: "goes_wrong",
      arguments: {},
    });

    const look = await client.look(aServer(), directory);

    assert.equal(look.isUp, true);
    assert.equal(look.calls.failedInARow, 1);
    assert.equal(look.calls.hasWorked, false);
    assert.equal(look.calls.lastFailure?.said, "немає такого файлу");
  });

  it("puts the count back to none as soon as one call works", async () => {
    await client.call({
      server: aServer(),
      directory,
      callId: "call-6",
      functionName: "goes_wrong",
      arguments: {},
    });
    await client.call({
      server: aServer(),
      directory,
      callId: "call-7",
      functionName: "read_file",
      arguments: {
        path: "README.md",
      },
    });

    const look = await client.look(aServer(), directory);

    assert.equal(look.calls.failedInARow, 0);
    assert.equal(look.calls.hasWorked, true);
  });

  it("forgets what the calls came to when the server is let go, because that connection is over", async () => {
    await client.call({
      server: aServer(),
      directory,
      callId: "call-8",
      functionName: "goes_wrong",
      arguments: {},
    });
    await client.close(SERVER_ID);

    const look = await client.look(aServer(), directory);

    assert.equal(look.calls.failedInARow, 0);
    assert.equal(look.calls.lastFailure, null);
  });

  it("answers a call of a function the server never knew, rather than losing the turn over it", async () => {
    const result = await client.call({
      server: aServer(),
      directory,
      callId: "call-9",
      functionName: "no_such_function",
      arguments: {},
    });

    assert.equal(result.isFailed, true);
    assert.match(result.output, new RegExp(MCP_FAILED_PREFIX.replace("[", "\\[")));
  });

  it("a server that falls mid-call is answered, and is not held as if it were still up", async () => {
    const server = aServer();
    const result = await client.call({
      server,
      directory,
      callId: "call-10",
      functionName: "falls",
      arguments: {},
    });

    assert.equal(result.isFailed, true);
    assert.equal(client.isUp(SERVER_ID), false);
  });

  it("a server that fell is started again by the next call, and answers it", async () => {
    const server = aServer();

    await client.call({
      server,
      directory,
      callId: "call-11",
      functionName: "falls",
      arguments: {},
    });

    const result = await client.call({
      server,
      directory,
      callId: "call-12",
      functionName: "read_file",
      arguments: {
        path: "again.md",
      },
    });

    assert.equal(result.output, "read again.md");
    assert.equal(result.isFailed, false);
  });

  it("refuses to call a remote server the same way it refuses to list one", async () => {
    const result = await client.call({
      server: aServer({
        isLocal: false,
        run: "",
        address: "https://mcp.example.com/sse",
        signIn: "browser",
      }),
      directory,
      callId: "call-13",
      functionName: "read_file",
      arguments: {},
    });

    assert.equal(result.isFailed, true);
    assert.match(result.output, new RegExp(MCP_REMOTE_NOT_BUILT));
  });
});
