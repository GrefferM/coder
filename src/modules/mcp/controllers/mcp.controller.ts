import { Validate } from "../../../utils/dto-validation";
import { McpClient, McpMemory, McpSecrets } from "../services";
import {
  CloseMcpServerDto,
  DropMcpServerDto,
  LookMcpServerDto,
  McpSecretsHeldDto,
  SaveMcpEnvValueDto,
  SaveMcpTokenDto,
  SeenMcpServerDto,
  SweepMcpKeysDto,
} from "../dto";
import type { McpLook, McpSecretsHeld } from "../interfaces";

/** The one door a screen reaches an MCP server through: what it hands over and what this machine holds for it. */
export class McpController {
  constructor(
    private readonly client: McpClient,
    private readonly secrets: McpSecrets,
    private readonly memory: McpMemory,
  ) {}

  @Validate()
  async look(payload: LookMcpServerDto): Promise<McpLook> {
    const look = await this.client.look(payload.server, payload.directory);

    /**
     * What the server cannot say itself: when its list last changed and what it was before. Only an answer is remembered; a
     * fall is not written down as an empty list.
     */
    return look.isUp
      ? {
          ...look,
          ...(await this.memory.after(look.serverId, look.functions)),
        }
      : look;
  }

  @Validate()
  async seen(payload: SeenMcpServerDto): Promise<void> {
    return this.memory.seen(payload.id);
  }

  @Validate()
  async close(payload: CloseMcpServerDto): Promise<void> {
    return this.client.close(payload.id);
  }

  @Validate()
  async saveToken(payload: SaveMcpTokenDto): Promise<void> {
    return this.secrets.saveToken(payload);
  }

  @Validate()
  async saveEnvValue(payload: SaveMcpEnvValueDto): Promise<void> {
    return this.secrets.saveEnvValue(payload);
  }

  @Validate()
  async heldSecrets(payload: McpSecretsHeldDto): Promise<McpSecretsHeld> {
    return this.secrets.held(payload);
  }

  @Validate()
  async dropServer(payload: DropMcpServerDto): Promise<void> {
    return this.secrets.drop(payload.id);
  }

  @Validate()
  async sweepKeys(payload: SweepMcpKeysDto): Promise<void> {
    return this.secrets.sweep(payload.serverIds);
  }
}
