import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CloseMcpServerDto,
  LookMcpServerDto,
  McpController,
  McpSecretsHeldDto,
  SaveMcpEnvValueDto,
  SaveMcpTokenDto,
} from "../../../modules/mcp";
import {
  CLOSE_MCP_SERVER_CHANNEL,
  LOOK_MCP_SERVER_CHANNEL,
  MCP_SECRETS_HELD_CHANNEL,
  SAVE_MCP_ENV_VALUE_CHANNEL,
  SAVE_MCP_TOKEN_CHANNEL,
} from "../../../contracts";
import { ProjectMcpServerDto } from "../../../modules/projects";
import { MCP_IPC_CHANNELS } from "./mcp-ipc-channels";

function controllerRecording(received: unknown[]): McpController {
  return <McpController>(<unknown>{
    look: async (payload: unknown) => {
      received.push(payload);
    },
    close: async (payload: unknown) => {
      received.push(payload);
    },
    saveToken: async (payload: unknown) => {
      received.push(payload);
    },
    saveEnvValue: async (payload: unknown) => {
      received.push(payload);
    },
    heldSecrets: async (payload: unknown) => {
      received.push(payload);
    },
  });
}

const SERVER = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "filesystem",
  isLocal: true,
  run: "npx server-filesystem .",
  address: "",
  signIn: "none",
  env: [],
};

describe("MCP_IPC_CHANNELS", () => {
  it("rebuilds a look into a real DTO, so its decorators are readable", async () => {
    const received: unknown[] = [];

    await MCP_IPC_CHANNELS[LOOK_MCP_SERVER_CHANNEL](controllerRecording(received), {
      directory: "/tmp/coder-project",
      server: SERVER,
    });

    assert.ok(received[0] instanceof LookMcpServerDto);
    // The nested server is rebuilt too.
    assert.ok((<LookMcpServerDto>received[0]).server instanceof ProjectMcpServerDto);
    assert.equal((<LookMcpServerDto>received[0]).server.run, "npx server-filesystem .");
  });

  it("lets a server go by its id, and by nothing else", async () => {
    const received: unknown[] = [];

    await MCP_IPC_CHANNELS[CLOSE_MCP_SERVER_CHANNEL](controllerRecording(received), {
      id: SERVER.id,
    });

    assert.ok(received[0] instanceof CloseMcpServerDto);
    assert.equal((<CloseMcpServerDto>received[0]).id, SERVER.id);
  });

  it("rebuilds every door of the keychain, so an id that is not one is refused at the door", async () => {
    // These three carry what opens a server.
    const received: unknown[] = [];
    const controller = controllerRecording(received);

    await MCP_IPC_CHANNELS[SAVE_MCP_TOKEN_CHANNEL](controller, {
      serverId: SERVER.id,
      value: "sk-the-token",
    });
    await MCP_IPC_CHANNELS[SAVE_MCP_ENV_VALUE_CHANNEL](controller, {
      serverId: SERVER.id,
      name: "BRAVE_API_KEY",
      value: "sk-brave",
    });
    await MCP_IPC_CHANNELS[MCP_SECRETS_HELD_CHANNEL](controller, {
      serverId: SERVER.id,
    });

    assert.ok(received[0] instanceof SaveMcpTokenDto);
    assert.ok(received[1] instanceof SaveMcpEnvValueDto);
    assert.ok(received[2] instanceof McpSecretsHeldDto);
    assert.equal((<SaveMcpEnvValueDto>received[1]).name, "BRAVE_API_KEY");
  });
});
