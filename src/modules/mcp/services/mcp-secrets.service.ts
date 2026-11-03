import { MCP_ENV_PREFIX, MCP_TOKEN_PREFIX } from "../constants";
import { UNDO_STANDS_MS } from "../../../contracts";
import type { McpDroppedStore, McpSecretStore, McpSecretsHeld } from "../interfaces";
import type { McpSecretsHeldDto, SaveMcpEnvValueDto, SaveMcpTokenDto } from "../dto";

/**
 * Everything of a server that stays on this machine: the secrets, held by the server's id so a rename or move keeps
 * them. The project file names only the way in and the variable names.
 */
export class McpSecrets {
  constructor(
    private readonly store: McpSecretStore,
    private readonly dropped: McpDroppedStore,
  ) {}

  /**
   * A server was deleted and its keys are owed a sweep. They stay for the undo's thirty seconds; this only records the
   * debt, so the sweep finishes even if the app closes.
   */
  async drop(serverId: string): Promise<void> {
    await this.dropped.put(serverId, Date.now());
  }

  /**
   * Removes the keys of every server this machine dropped whose undo has run out and which the project does not name;
   * called when a project opens and when a deletion's timer runs out. Nothing is swept for being unknown.
   */
  async sweep(serverIds: string[]): Promise<void> {
    const standing = new Set(serverIds);
    const dropped = await this.dropped.all();
    // A server in the file again was restored by ⌘Z: the debt is cancelled and the keys stay.
    const cameBack = dropped.filter(({ serverId }) => standing.has(serverId)).map(({ serverId }) => serverId);
    const owed = dropped.filter(
      ({ serverId, droppedAt }) => !standing.has(serverId) && Date.now() - droppedAt >= UNDO_STANDS_MS,
    );

    for (const { serverId } of owed) {
      await this.take(serverId);
    }

    await this.dropped.forget([...cameBack, ...owed.map(({ serverId }) => serverId)]);
  }

  /** Writes the token from the one field; an empty value removes it, as with a provider's key. */
  async saveToken(payload: SaveMcpTokenDto): Promise<void> {
    await this.write(`${MCP_TOKEN_PREFIX}${payload.serverId}`, payload.value);
  }

  /** Writes one variable's value; emptying the field removes it from this machine. */
  async saveEnvValue(payload: SaveMcpEnvValueDto): Promise<void> {
    await this.write(`${MCP_ENV_PREFIX}${payload.serverId}:${payload.name}`, payload.value);
  }

  /**
   * What this machine holds for one server, never the values. A screen draws «НЕМА ЗНАЧЕННЯ: BRAVE_API_KEY» from the
   * difference between the file's names and this.
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

  /** Everything one server holds here: its token and every value, by key heads. */
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

  /** What is typed is kept; what is emptied is removed rather than kept as "". */
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
