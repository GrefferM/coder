import { MCP_ENV_PREFIX, MCP_TOKEN_PREFIX } from "../constants";
import { UNDO_STANDS_MS } from "../../../contracts";
import type { McpDroppedStore, McpSecretStore, McpSecretsHeld } from "../interfaces";
import type { McpSecretsHeldDto, SaveMcpEnvValueDto, SaveMcpTokenDto } from "../dto";

/**
 * Everything of a server that stays on this machine. The project file names the way in and
 * the names of the variables; what opens them lives here, because the file goes into a repository and a key in it
 * would be a key in a pull request.
 *
 * Everything is held by the server's **id**: a server renamed, or moved to another address, is the same server and
 * keeps what was typed in for it.
 */
export class McpSecrets {
  constructor(
    private readonly store: McpSecretStore,
    private readonly dropped: McpDroppedStore,
  ) {}

  /**
   * A server has been deleted, and its keys are owed a sweep. They do not go yet — the undo has
   * thirty seconds, and ⌘Z must hand the server back **with** them — so all that happens here is that this
   * machine writes down the debt, which is what lets the sweep finish even if the app closes in between.
   */
  async drop(serverId: string): Promise<void> {
    await this.dropped.put(serverId, Date.now());
  }

  /**
   * Takes off this machine the keys of every server it dropped, whose undo has run out and which the
   * project no longer names. Called when a project opens, and again when a deletion's own timer runs out.
   *
   * Nothing is ever swept for being **unknown**: the keychain is the machine's and holds other projects' servers
   * too, and a rule of «not in this project» would take a colleague's token off with it. Only an id this machine
   * dropped on purpose is touched, and only after the undo could no longer bring it back.
   */
  async sweep(serverIds: string[]): Promise<void> {
    const standing = new Set(serverIds);
    const dropped = await this.dropped.all();
    // A server that is in the file again was brought back by ⌘Z: the debt is cancelled and the keys stay.
    const cameBack = dropped.filter(({ serverId }) => standing.has(serverId)).map(({ serverId }) => serverId);
    const owed = dropped.filter(
      ({ serverId, droppedAt }) => !standing.has(serverId) && Date.now() - droppedAt >= UNDO_STANDS_MS,
    );

    for (const { serverId } of owed) {
      await this.take(serverId);
    }

    await this.dropped.forget([...cameBack, ...owed.map(({ serverId }) => serverId)]);
  }

  /** Writes the token typed into the one field; an empty value takes it away, as a provider's key does. */
  async saveToken(payload: SaveMcpTokenDto): Promise<void> {
    await this.write(`${MCP_TOKEN_PREFIX}${payload.serverId}`, payload.value);
  }

  /** Writes one variable's value; emptying the field takes the value off this machine. */
  async saveEnvValue(payload: SaveMcpEnvValueDto): Promise<void> {
    await this.write(`${MCP_ENV_PREFIX}${payload.serverId}:${payload.name}`, payload.value);
  }

  /**
   * What this machine holds for one server, and never what it is. A screen draws «НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY»
   * from the difference between what the file names and what comes back from here.
   */
  async held(payload: McpSecretsHeldDto): Promise<McpSecretsHeld> {
    const hints = await this.store.hints();
    const environment = `${MCP_ENV_PREFIX}${payload.serverId}:`;

    return {
      token: hints.find(({ key }) => key === `${MCP_TOKEN_PREFIX}${payload.serverId}`)?.hint ?? null,
      env: Object.fromEntries(
        hints
          .filter(({ key }) => key.startsWith(environment))
          .map(({ key, hint }) => [key.slice(environment.length), hint]),
      ),
    };
  }

  /** Everything one server holds here — its token and every value, by the heads of their keys and nothing else. */
  private async take(serverId: string): Promise<void> {
    const token = `${MCP_TOKEN_PREFIX}${serverId}`;
    const environment = `${MCP_ENV_PREFIX}${serverId}:`;
    const hints = await this.store.hints();

    for (const { key } of hints.filter(({ key }) => key === token || key.startsWith(environment))) {
      await this.store.remove({
        key,
      });
    }
  }

  /** One rule for both: what is typed in is kept, and what is emptied is gone rather than kept as "". */
  private async write(key: string, value: string): Promise<void> {
    const written = value.trim();

    if (written === "") {
      await this.store.remove({
        key,
      });

      return;
    }

    await this.store.set({
      key,
      value: written,
    });
  }
}
