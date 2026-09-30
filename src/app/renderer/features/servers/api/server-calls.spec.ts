import { describe, expect, it, vi } from "vitest";
import { closeServer, lookServer, saveServerEnvValue, saveServerToken, serverSecretsHeld } from "./server-calls";
import {
  CLOSE_MCP_SERVER_CHANNEL,
  LOOK_MCP_SERVER_CHANNEL,
  MCP_SECRETS_HELD_CHANNEL,
  SAVE_MCP_ENV_VALUE_CHANNEL,
  SAVE_MCP_TOKEN_CHANNEL,
} from "../../../../../contracts";
import { standInBridge } from "../../../testing";
import type { McpLook, ProjectMcpServer } from "../../../interfaces";
import { NO_MCP_CALLS } from "../../../interfaces";

const SERVER: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "filesystem",
  isLocal: true,
  run: "npx server-filesystem .",
  address: "",
  signIn: "none",
  env: [],
};

const LOOK: McpLook = {
  serverId: SERVER.id,
  isUp: true,
  functions: [
    {
      name: "read_file",
      description: "Читає файл",
      parameters: {},
    },
  ],
  answeredAt: 1_700_000_000_000,
  failure: null,
  changedAt: null,
  wasCount: null,
  calls: NO_MCP_CALLS,
};

function machine(answer: unknown) {
  const invoke = vi.fn(async () => answer);

  standInBridge({
    invoke,
  });

  return invoke;
}

function brokenMachine() {
  const invoke = vi.fn(async () => {
    throw new Error("no machine");
  });

  standInBridge({
    invoke,
  });

  return invoke;
}

describe("server calls", () => {
  it("asks one server what it hands over, naming the folder it is started in", async () => {
    const invoke = machine(LOOK);

    expect(await lookServer("/tmp/coder", SERVER)).toEqual(LOOK);
    expect(invoke).toHaveBeenCalledWith(LOOK_MCP_SERVER_CHANNEL, {
      directory: "/tmp/coder",
      server: SERVER,
    });
  });

  it("takes an unreachable machine as a server that is not up, not as a fall", async () => {
    brokenMachine();

    const look = await lookServer("/tmp/coder", SERVER);

    expect(look.isUp).toBe(false);
    expect(look.serverId).toBe(SERVER.id);
    expect(look.functions).toEqual([]);
    expect(look.answeredAt).toBeNull();
    expect(look.failure).toContain("no machine");
  });

  it("lets a server go by its id, and by nothing else", async () => {
    const invoke = machine(undefined);

    await closeServer(SERVER.id);

    expect(invoke).toHaveBeenCalledWith(CLOSE_MCP_SERVER_CHANNEL, {
      id: SERVER.id,
    });
  });

  it("writes the token for one server, by that server's id", async () => {
    const invoke = machine(undefined);

    await saveServerToken(SERVER.id, "sk-the-token");

    expect(invoke).toHaveBeenCalledWith(SAVE_MCP_TOKEN_CHANNEL, {
      serverId: SERVER.id,
      value: "sk-the-token",
    });
  });

  it("writes one variable's value, naming which variable of which server it is", async () => {
    const invoke = machine(undefined);

    await saveServerEnvValue(SERVER.id, "BRAVE_API_KEY", "sk-brave");

    expect(invoke).toHaveBeenCalledWith(SAVE_MCP_ENV_VALUE_CHANNEL, {
      serverId: SERVER.id,
      name: "BRAVE_API_KEY",
      value: "sk-brave",
    });
  });

  it("asks what this machine holds for one server, and takes an unreachable machine as holding nothing", async () => {
    const invoke = machine({
      token: "sk-…c0d",
      env: {
        BRAVE_API_KEY: "sk-…rav",
      },
    });

    expect(await serverSecretsHeld(SERVER.id)).toEqual({
      token: "sk-…c0d",
      env: {
        BRAVE_API_KEY: "sk-…rav",
      },
    });
    expect(invoke).toHaveBeenCalledWith(MCP_SECRETS_HELD_CHANNEL, {
      serverId: SERVER.id,
    });

    brokenMachine();

    // When the answer never came, nothing is claimed about what was typed.
    expect(await serverSecretsHeld(SERVER.id)).toEqual({
      token: null,
      env: {},
    });
  });

  it("letting go on an unreachable machine is nothing to answer for", async () => {
    brokenMachine();

    await expect(closeServer(SERVER.id)).resolves.toBeUndefined();
  });
});
