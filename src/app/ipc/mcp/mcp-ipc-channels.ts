import {
  CloseMcpServerDto,
  DropMcpServerDto,
  LookMcpServerDto,
  McpController,
  McpSecretsHeldDto,
  SaveMcpEnvValueDto,
  SaveMcpTokenDto,
  SeenMcpServerDto,
  SweepMcpKeysDto,
} from "../../../modules/mcp";
import { ProjectMcpServerDto } from "../../../modules/projects";
import {
  CLOSE_MCP_SERVER_CHANNEL,
  DROP_MCP_SERVER_CHANNEL,
  LOOK_MCP_SERVER_CHANNEL,
  MCP_SECRETS_HELD_CHANNEL,
  SAVE_MCP_ENV_VALUE_CHANNEL,
  SAVE_MCP_TOKEN_CHANNEL,
  SEEN_MCP_SERVER_CHANNEL,
  SWEEP_MCP_KEYS_CHANNEL,
} from "../../../contracts";
import type { IpcChannelMap } from "../register-ipc-channels";

/**
 * The doors to a server — look at it, and let it go so the next look starts it afresh. Three more are about this
 * machine alone: what opens a server never goes near the project file.
 */
export const MCP_IPC_CHANNELS: IpcChannelMap<McpController> = {
  [LOOK_MCP_SERVER_CHANNEL]: (controller, payload) => {
    const look = Object.assign(new LookMcpServerDto(), payload);

    // The server inside is a plain object too, and a nested check reads an instance or nothing at all.
    look.server = Object.assign(new ProjectMcpServerDto(), look.server);

    return controller.look(look);
  },
  [CLOSE_MCP_SERVER_CHANNEL]: (controller, payload) =>
    controller.close(Object.assign(new CloseMcpServerDto(), payload)),
  [SEEN_MCP_SERVER_CHANNEL]: (controller, payload) => controller.seen(Object.assign(new SeenMcpServerDto(), payload)),
  [DROP_MCP_SERVER_CHANNEL]: (controller, payload) =>
    controller.dropServer(Object.assign(new DropMcpServerDto(), payload)),
  [SWEEP_MCP_KEYS_CHANNEL]: (controller, payload) =>
    controller.sweepKeys(Object.assign(new SweepMcpKeysDto(), payload)),
  [SAVE_MCP_TOKEN_CHANNEL]: (controller, payload) =>
    controller.saveToken(Object.assign(new SaveMcpTokenDto(), payload)),
  [SAVE_MCP_ENV_VALUE_CHANNEL]: (controller, payload) =>
    controller.saveEnvValue(Object.assign(new SaveMcpEnvValueDto(), payload)),
  [MCP_SECRETS_HELD_CHANNEL]: (controller, payload) =>
    controller.heldSecrets(Object.assign(new McpSecretsHeldDto(), payload)),
};
